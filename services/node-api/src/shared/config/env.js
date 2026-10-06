import dotenv from 'dotenv';
dotenv.config();

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[Config Error] Variable de entorno requerida no encontrada: ${key}`);
  }
  return value;
}

export const env = {
  port: parseInt(getRequiredEnv('PORT'), 10),
  nodeEnv: process.env.NODE_ENV || 'development'
};
