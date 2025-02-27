export default {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
    link: { type: 'string' },
    github: { type: 'string' },
    major: { type: 'string' },
    short_answer: { type: 'string' },
    shirt_size: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    dietary_restrictions: { type: 'string' },
    special_needs: { type: 'string' },
    date_of_birth: { type: 'string' },
    school: { type: 'string' },
    grad_year: { type: 'string' },
    gender: { type: 'string' },
    level_of_study: { type: 'string' },
    ethnicity: { type: 'string' },
    phone_number: { type: 'string' },
  },
  required: ['email', 'password'],
} as const;
