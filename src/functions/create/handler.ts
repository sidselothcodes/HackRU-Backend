import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import * as bcrypt from 'bcrypt';

import schema from './schema';

import { MongoDB } from '../../util';
import * as config from '../../config';

const create: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const validRegistrationTime = registrationTime();
  //check link
  if (!validRegistrationTime) {
    return {
      statusCode: 403,
      body: 'Registration is closed!',
    };
  }

  const uEmail = event.body.email;
  let password = event.body.password;

  try {
    password = await bcrypt.hash(password, 8);

    const db = MongoDB.getInstance(config.DEV_MONGO_URI);
    await db.connect();

    const users = db.getCollection('users');
    const existingUser = await users.findOne({ uEmail });

    if (existingUser) {
      //link
      return {
        statusCode: 400,
        body: 'Duplicate user!',
      };
    }
    //add registration status
    const doc = {
      email: uEmail,
      role: {
        hacker: true,
        volunteer: false,
        judge: false,
        sponsor: false,
        mentor: false,
        organizer: false,
        director: false,
      },
      votes: 0,
      password: password,
      github: event.body.github,
      major: event.body.major,
      short_answer: event.body.short_answer,
      shirt_size: event.body.shirt_size,
      first_name: event.body.github,
      last_name: event.body.last_name,
      dietary_restrictions: event.body.dietary_restrictions,
      special_needs: event.body.special_needs,
      date_of_birth: event.body.date_of_birth,
      school: event.body.school,
      grad_year: event.body.grad_year,
      gender: event.body.gender,
      level_of_study: event.body.level_of_study,
      ethnicity: event.body.ethnicity,
      phone_numer: event.body.phone_number,
      day_of: {
        checkIn: false,
      },
    };

    await users.insertOne(doc);
    return {
      statusCode: 200,
      body: 'User created!',
    };
  } catch (error) {
    console.error('Error creating user', error);
  }
};

const registrationTime = (): boolean => {
  const now = new Date().getTime();

  //arbitrary start and end dates for registration for now
  const registrationStart = new Date(config.registrationStart).getTime();
  const registrationEnd = new Date(config.registrationEnd).getTime();

  return now >= registrationStart && now <= registrationEnd;
};

export const main = middyfy(create);
