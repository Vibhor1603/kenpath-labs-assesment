export type Source = {
  id: string;
  title: string;
  url: string;
  usedFor: string;
};

export const sources: Source[] = [
  {
    id: "refrigerator",
    title: "How refrigerators work",
    url: "https://www.explainthatstuff.com/refrigerator.html",
    usedFor:
      "Compressor, condenser coils behind the fridge, expansion valve (fixed orifice), refrigerant cooling as it expands.",
  },
  {
    id: "photosynthesis-ng",
    title: "Photosynthesis",
    url: "https://education.nationalgeographic.org/resource/photosynthesis/",
    usedFor:
      "Chloroplasts, chlorophyll, carbon dioxide in and oxygen out, sugar (glucose) stored as energy.",
  },
  {
    id: "photosynthesis-khan",
    title: "Intro to photosynthesis",
    url: "https://www.khanacademy.org/science/ap-biology/cellular-energetics/photosynthesis/a/intro-to-photosynthesis",
    usedFor: "Leaf structure: mesophyll, stomata, veins.",
  },
  {
    id: "heart-blood-flow",
    title: "Blood flow through the heart",
    url: "https://www.nhlbi.nih.gov/health/heart/blood-flow",
    usedFor: "Valves stop backflow, right side to lungs, left side to body.",
  },
  {
    id: "heart-anatomy",
    title: "Heart anatomy",
    url: "https://www.nhlbi.nih.gov/health/heart/anatomy",
    usedFor: "Four chambers and the major vessels.",
  },
];
