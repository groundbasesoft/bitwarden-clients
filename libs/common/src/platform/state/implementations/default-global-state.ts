import {
  BehaviorSubject,
  Observable,
  defer,
  filter,
  firstValueFrom,
  map,
  shareReplay,
  tap,
  timeout,
} from "rxjs";
import { Jsonify } from "type-fest";

import { AbstractStorageService } from "../../abstractions/storage.service";
import { globalKeyBuilder } from "../../misc/key-builders";
import { GlobalState } from "../global-state";
import { KeyDefinition } from "../key-definition";
import { StateUpdateOptions, populateOptionsWithDefault } from "../state-update-options";

const FAKE_DEFAULT = Symbol("fakeDefault");

export class DefaultGlobalState<T> implements GlobalState<T> {
  private storageKey: string;

  protected stateSubject: BehaviorSubject<T | typeof FAKE_DEFAULT> = new BehaviorSubject<
    T | typeof FAKE_DEFAULT
  >(FAKE_DEFAULT);

  state$: Observable<T>;

  constructor(
    private keyDefinition: KeyDefinition<T>,
    private chosenLocation: AbstractStorageService
  ) {
    this.storageKey = globalKeyBuilder(this.keyDefinition);

    const storageUpdates$ = this.chosenLocation.updates$.pipe(
      filter((update) => update.key === this.storageKey),
      map((update) => {
        return this.keyDefinition.deserializer(update.value as Jsonify<T>);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.state$ = defer(() => {
      const storageUpdateSubscription = storageUpdates$.subscribe((value) => {
        this.stateSubject.next(value);
      });

      this.getFromState().then((s) => {
        this.stateSubject.next(s);
      });

      return this.stateSubject.pipe(
        tap({
          complete: () => {
            storageUpdateSubscription.unsubscribe();
          },
        })
      );
    }).pipe(
      shareReplay({ refCount: false, bufferSize: 1 }),
      filter<T>((i) => i != FAKE_DEFAULT)
    );
  }

  async update<TCombine>(
    configureState: (state: T, dependency: TCombine) => T | Promise<T>,
    options: StateUpdateOptions<T, TCombine> = {}
  ): Promise<T> {
    options = populateOptionsWithDefault(options);
    const currentState = await this.getGuaranteedState();
    const combinedDependencies =
      options.combineLatestWith != null
        ? await firstValueFrom(options.combineLatestWith.pipe(timeout(options.msTimeout)))
        : null;

    if (!options.shouldUpdate(currentState, combinedDependencies)) {
      return;
    }

    let newState = configureState(currentState, combinedDependencies);
    if (newState instanceof Promise) {
      newState = await newState;
    }
    await this.chosenLocation.save(this.storageKey, newState);
    return newState;
  }

  private async getGuaranteedState() {
    const currentValue = this.stateSubject.getValue();
    return currentValue === FAKE_DEFAULT ? await this.getFromState() : currentValue;
  }

  async getFromState(): Promise<T> {
    const data = await this.chosenLocation.get<Jsonify<T>>(this.storageKey);
    return this.keyDefinition.deserializer(data);
  }
}
