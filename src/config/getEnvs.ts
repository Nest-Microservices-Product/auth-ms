import 'dotenv/config';
import { envSchema } from './validators/EnvVarSchema.validator';
import { EnvVars } from './entities/EnvVars.entity';

const getEnvVars = () => {
  const { error, value } = envSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env?.NATS_SERVERS.split(','),
  });

  if (error) {
    throw new Error(
      `There was an error with the config validation ${error.message}`,
    );
  }

  const envVars: EnvVars = value;

  return {
    port: envVars.PORT,
    natsServers: envVars.NATS_SERVERS,
    databaseUrl: envVars.DATABASE_URL,
    jwtSecret: envVars.JWT_SECRET,
  };
};

export const envs = getEnvVars();
