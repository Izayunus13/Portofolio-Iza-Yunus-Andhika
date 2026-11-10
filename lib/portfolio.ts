export type CategoryId = 'programming' | 'design' | 'videography';
export type Project = {
  title: string;
  label: string;
  description: string;
  tags: string[];
  media: string | null;
  mediaType?: 'image' | 'video';
  url: string | null;
};
export type Category = {
  id: CategoryId;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  port: string;
  projects: Project[];
};

// Replace the concept entries below with your own work.
// Media: place files in public/portfolio/, then use '/portfolio/your-file.jpg'.
// Video: set mediaType to 'video'. Link: replace url: null with a full https:// URL.
// Keep null values until your media and links are ready; the page handles them gracefully.
export const categories: Category[] = [
  {
    id: 'programming', number: '01', title: 'Built with curiosity.', subtitle: 'Software Engineering', port: 'Code Cove',
    description: 'Turning ideas into thoughtful digital experiences. I explore the space between clean code, useful features, and the little details that make a product feel right.',
    projects: [
      { title: 'Ideas, brought to life.', label: 'Web Application', description: 'A space for a future software project. Share the challenge, your approach, and the experience you built. From the first line of code to the final interaction, this is where the story unfolds.', tags: ['Development', 'Web Application', 'Project concept'], media: null, url: null },
      { title: 'A smoother everyday.', label: 'Interactive Experience', description: 'A space for a tool that makes something simpler. Describe the problem you noticed, the decisions you made, and how your solution helps people get things done.', tags: ['Problem Solving', 'Interaction', 'Project concept'], media: null, url: null },
      { title: 'The next discovery.', label: 'Creative Experiment', description: 'A space for experiments, prototypes, and things built out of curiosity. Add a walkthrough of your process, what you learned, and what you would explore next.', tags: ['Prototyping', 'Exploration', 'Project concept'], media: null, url: null },
    ],
  },
  {
    id: 'design', number: '02', title: 'Made to feel different.', subtitle: 'Website & Visual Design', port: 'Design Island',
    description: 'A good design does more than look beautiful. I bring together soft palettes, clear visual stories, and intuitive interfaces to create experiences with a little personality.',
    projects: [
      { title: 'A world of its own.', label: 'Website Design', description: 'A space for a website with its own personality. Show the visual direction, the interface, and the small decisions that connect a brand to the people who use it.', tags: ['UI / UX', 'Web Design', 'Project concept'], media: null, url: null },
      { title: 'An identity with character.', label: 'Visual Identity', description: 'A space for a visual identity project. Tell the story behind the colors, typography, and graphic language, and show how everything comes together across different touchpoints.', tags: ['Art Direction', 'Brand Identity', 'Project concept'], media: null, url: null },
      { title: 'Little details. Big feeling.', label: 'Digital Experience', description: 'A space for a thoughtful digital experience. Share your research, early explorations, and final designs, with a closer look at the details that make it yours.', tags: ['Visual Design', 'Interaction', 'Project concept'], media: null, url: null },
    ],
  },
  {
    id: 'videography', number: '03', title: 'Stories, set in motion.', subtitle: 'Videography & Editing', port: 'Motion Bay',
    description: 'Some stories are meant to move. Through framing, rhythm, and editing, I explore how everyday moments can become something worth watching, feeling, and remembering.',
    projects: [
      { title: 'Between the moments.', label: 'Visual Story', description: 'A space for a film or video that tells a story. Add your footage, describe the idea behind it, and share how the framing, sound, and edit bring the narrative to life.', tags: ['Videography', 'Storytelling', 'Project concept'], media: null, mediaType: 'video', url: null },
      { title: 'A different perspective.', label: 'Creative Film', description: 'A space for a creative film project. Show the places, people, or ideas that caught your eye, and explain the choices that shaped the mood of the final piece.', tags: ['Cinematography', 'Color', 'Project concept'], media: null, mediaType: 'video', url: null },
      { title: 'Finding the rhythm.', label: 'Editing & Motion', description: 'A space for work where the edit tells the story. Add a reel or a finished piece, then walk through your use of pacing, transitions, music, and visual rhythm.', tags: ['Video Editing', 'Motion', 'Project concept'], media: null, mediaType: 'video', url: null },
    ],
  },
];

// Add only the contact channels you want to make public.
export const contact = {
  email: '',
  instagram: '',
  linkedin: '',
};
