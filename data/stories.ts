export interface Story {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  readingTimeMinutes: number;
}

export const stories: Story[] = [
  {
    id: "small-wins",
    title: "Small Wins Matter",
    summary: "How tiny daily wins compound into big emotional progress.",
    content:
      "Maya started tracking one small win per day in a notebook. After ninety days she had ninety wins written down. Reading them back took her less than ten minutes but the effect was profound — she could see a person who kept showing up, even on hard days. Progress is rarely visible day to day. It becomes visible when you look back.",
    author: "Editorial",
    readingTimeMinutes: 2,
  },
  {
    id: "slow-growth",
    title: "Slow Growth Is Still Growth",
    summary: "A reminder that consistency beats intensity over time.",
    content:
      "A bamboo seed spends its first four years underground developing its root system. In year five it grows twenty-seven metres in six weeks. Most people only see the five-week explosion and call it overnight success. Your consistent daily effort is root growth. Trust the process underneath.",
    author: "Editorial",
    readingTimeMinutes: 2,
  },
  {
    id: "rest-is-productive",
    title: "Rest Is Part of the Work",
    summary: "The athletes who recover well are the ones who perform consistently.",
    content:
      "Elite coaches discovered decades ago that the limiting factor in athletic improvement is not training volume — it is recovery quality. The same principle applies to mental performance. Deep work requires deep rest. Scheduling recovery is not laziness; it is strategy.",
    author: "Editorial",
    readingTimeMinutes: 2,
  },
  {
    id: "identity-first",
    title: "Identity Before Outcome",
    summary: "Change your identity first and the behaviour follows naturally.",
    content:
      "James did not say 'I am trying to stop smoking.' He said 'I am not a smoker.' The small shift from aspiration to identity changes how you make decisions in the moment. Every action becomes a vote for the person you believe yourself to be. Cast enough votes and the identity solidifies.",
    author: "Editorial",
    readingTimeMinutes: 2,
  },
  {
    id: "one-percent",
    title: "The One Percent Principle",
    summary: "Getting 1% better each day produces remarkable results across a year.",
    content:
      "One percent daily improvement compounds to 37x improvement over a year. One percent daily decline compounds to near zero. The maths of consistency are unforgiving in both directions. The question is never 'did I have a breakthrough today?' but 'did I move the needle slightly in the right direction?'",
    author: "Editorial",
    readingTimeMinutes: 2,
  },
];
