insert into public.creatures (id, slug, name, rarity, description, accent, illustration)
values
  ('00000000-0000-0000-0000-000000000001', 'tower-owl', 'Tower Owl', 'Rare', 'Guards late-night momentum from the UT skyline.', 'from-amber to-coral', '🦉'),
  ('00000000-0000-0000-0000-000000000002', 'pcl-axolotl', 'PCL Axolotl', 'Epic', 'Thrives in quiet corners and impossible reading lists.', 'from-lake to-fern', '🦎'),
  ('00000000-0000-0000-0000-000000000003', 'union-fox', 'Union Fox', 'Common', 'Finds snacks, sofas, and the best people-watching angles.', 'from-coral to-amber', '🦊'),
  ('00000000-0000-0000-0000-000000000004', 'welch-sprite', 'Welch Sprite', 'Rare', 'Lives between equations, whiteboards, and breakthroughs.', 'from-fern to-lake', '✨'),
  ('00000000-0000-0000-0000-000000000005', 'pma-moth', 'PMA Moth', 'Common', 'Drawn to glowing problem sets and evening calm.', 'from-stone-300 to-slate-500', '🦋'),
  ('00000000-0000-0000-0000-000000000006', 'littlefield-bee', 'Littlefield Bee', 'Common', 'Organizes projects with suspicious efficiency.', 'from-yellow-300 to-amber', '🐝'),
  ('00000000-0000-0000-0000-000000000007', 'gsb-koi', 'GSB Koi', 'Rare', 'Swims through case studies and polished presentations.', 'from-sky-300 to-lake', '🐟'),
  ('00000000-0000-0000-0000-000000000008', 'fac-raccoon', 'FAC Raccoon', 'Epic', 'Makes treasures out of half-finished drafts and deadlines.', 'from-slate-400 to-zinc-700', '🦝'),
  ('00000000-0000-0000-0000-000000000009', 'eer-cicada', 'EER Cicada', 'Common', 'Buzzes brightest around hardware demos and all-nighters.', 'from-fern to-moss', '🪲'),
  ('00000000-0000-0000-0000-000000000010', 'law-cat', 'Law Cat', 'Rare', 'Keeps a precise eye on outlines and calm focus.', 'from-stone-200 to-zinc-500', '🐈')
on conflict (id) do nothing;

insert into public.study_spots (
  id,
  slug,
  name,
  building_code,
  description,
  long_description,
  tags,
  noise_level,
  outlet_availability,
  featured_creature_id
)
values
  ('10000000-0000-0000-0000-000000000001', 'perry-castaneda-library', 'Perry-Castaneda Library', 'PCL', 'The classic deep-focus campus library with plenty of floors to choose from.', 'PCL is the default answer for a reason: reliable seating, quiet stacks, strong study energy, and a wide mix of solo and group-friendly zones.', array['24-hour vibe', 'Quiet floors', 'Central campus'], 'Quiet', 'Plentiful', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000002', 'texas-union', 'Texas Union', 'UNB', 'High-energy common areas with easy food access and flexible seating.', 'The Union works well for lighter study blocks, collaborative sessions, and people who focus better with movement and ambient noise nearby.', array['Food nearby', 'Group study', 'Late afternoon'], 'Buzzing', 'Decent', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000003', 'welch-hall', 'Welch Hall Commons', 'WEL', 'Science-heavy study territory close to labs and engineering routes.', 'Welch is ideal when you want whiteboards, STEM energy, and quick access to classmates between lectures and labs.', array['Whiteboards', 'STEM hub', 'Group pods'], 'Moderate', 'Decent', '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000004', 'painter-hall', 'Painter Hall Atrium', 'PMA', 'Bright, steady, and good for knocking out medium-focus work.', 'Painter gives you a balance of motion and calm, making it useful for reading, problem sets, and between-class productivity.', array['Natural light', 'Math corridor', 'Drop-in sessions'], 'Moderate', 'Sparse', '00000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000005', 'littlefield-cafe', 'Littlefield Cafe', 'CMA', 'Warm cafe energy for planning, writing, and lighter deep-work blocks.', 'A strong option when you want a soft landing spot with coffee, quick meetings, and enough buzz to avoid feeling isolated.', array['Coffee', 'Writing', 'Casual focus'], 'Buzzing', 'Sparse', '00000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000006', 'gsb-commons', 'McCombs GSB Commons', 'GSB', 'Polished collaborative spaces with strong daytime productivity energy.', 'GSB commons suits students who prefer structured environments, cleaner furniture, and group work near business school resources.', array['Business school', 'Presentation prep', 'Collaborative'], 'Moderate', 'Plentiful', '00000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000007', 'fine-arts-center', 'Fine Arts Library', 'FAC', 'A tucked-away spot for quieter sessions and creative recharge.', 'The Fine Arts area has a hidden-gem feel that works especially well for reading-heavy work, sketching ideas, or escaping busier corridors.', array['Hidden gem', 'Creative work', 'Quiet corners'], 'Quiet', 'Decent', '00000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000008', 'engineering-education-research-center', 'Engineering Education and Research Center', 'EER', 'Modern study zones with maker energy and solid infrastructure.', 'EER is strong for project teams, code sessions, and long blocks where you need good outlets, tables, and a modern academic environment.', array['Engineering', 'Project work', 'Modern space'], 'Moderate', 'Plentiful', '00000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000009', 'main-building-lounge', 'Main Building Lounge', 'MAI', 'Historic architecture with classic UT atmosphere and strong focus energy.', 'The Main Building offers a more ceremonial mood, useful when you want to reset, read, or lean into the ritual of studying on campus.', array['Historic', 'Campus icon', 'Reading'], 'Quiet', 'Sparse', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000010', 'tnrl-reading-room', 'Tarlton Reading Room', 'TNRL', 'Serious quiet for long reading sessions and exam prep.', 'Tarlton is for students who want minimal distractions, polished quiet, and a setting that immediately raises the bar for attention.', array['Very quiet', 'Reading room', 'Exam prep'], 'Quiet', 'Decent', '00000000-0000-0000-0000-000000000010')
on conflict (id) do nothing;
