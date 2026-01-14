-- Seed Achievements Data (Robust)

-- Attempt to insert, updating if Name already exists
INSERT INTO achievements (name, description, icon, criteria, rarity)
VALUES
    (
        'Verified Pro',
        'Verified work email and identity.',
        'shield-check',
        '{"email_verified": true, "work_experiences": 1}',
        'common'
    ),
    (
        'Profile Architect',
        'Completed 100% of the profile setup.',
        'pencil-ruler',
        '{"profile_completion": 100}',
        'rare'
    ),
    (
        'Networker',
        'Connected with 5 or more professionals.',
        'users',
        '{"followers": 5}',
        'common'
    ),
    (
        'Showcase Master',
        'Pinned 3 or more projects or experiences.',
        'pin',
        '{"pinned_items": 3}',
        'rare'
    ),
    (
        'Industry Titan',
        'Verified 3 or more distinct work experiences.',
        'briefcase',
        '{"verifications": 3}',
        'epic'
    ),
    (
        'Early Adopter',
        'Joined during the beta phase.',
        'rocket',
        '{"joined_before": "2026-06-01"}',
        'legendary'
    )
ON CONFLICT (name) DO UPDATE 
SET 
    description = EXCLUDED.description,
    criteria = EXCLUDED.criteria,
    icon = EXCLUDED.icon,
    rarity = EXCLUDED.rarity;
