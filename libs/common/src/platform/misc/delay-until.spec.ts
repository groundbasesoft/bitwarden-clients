import { TestScheduler } from "rxjs/testing";

import { delayUntil } from "./delay-until";

describe("delayUntil", () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it("should not emit if not triggered", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const e1 = cold("                 -a--b--c---|");
      const triggerSource = cold<void>("-----------|");
      const expected = "                -----------|";

      expectObservable(e1.pipe(delayUntil(triggerSource))).toBe(expected);
    });
  });

  it("should emit the last value when triggered", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const e1 = cold("                 -a--b--c---|");
      const triggerSource = cold<void>("-----x-xx--x|");
      const expected = "                -----b-cc--c|";

      expectObservable(e1.pipe(delayUntil(triggerSource))).toBe(expected);
    });
  });

  it("should clean up the inner subscriptions", () => {
    testScheduler.run((helpers) => {
      const { cold, expectSubscriptions, flush } = helpers;
      const e1 = cold("                 -a--b--c---|");
      const e1Subs = "                  ^----------!";
      const triggerSource = cold<void>("-----------|");
      const triggerSubs = "             ^----------!";

      const subscription = e1.pipe(delayUntil(triggerSource)).subscribe();
      flush(); // flush marbles
      subscription.unsubscribe();

      expectSubscriptions(e1.subscriptions).toBe(e1Subs);
      expectSubscriptions(triggerSource.subscriptions).toBe(triggerSubs);
    });
  });
});
