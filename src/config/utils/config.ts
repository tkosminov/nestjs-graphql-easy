import { config } from 'dotenv-flow';

const EXPAND_REGEX = /(?<!\\)\${([^{}]+)}|(?<!\\)\$([A-Za-z_][A-Za-z0-9_]*)/g;

function loadConfig(config_path: string) {
  const { parsed, error } = config({ path: config_path });

  if (error) {
    throw error;
  }

  if (!parsed) {
    throw new Error('Failed to initialize .env');
  }

  return parsed;
}

function replaceEnv(raw_process_env: Record<string, string>, parsed: Record<string, string>) {
  const all_envs: Record<string, string> = { ...parsed, ...raw_process_env };

  const expand = (str: string) =>
    str.replace(EXPAND_REGEX, (original_key, braced_key, unbraced_key) => {
      const key = braced_key ?? unbraced_key;

      if (key in all_envs) {
        return all_envs[key];
      }

      console.warn(`Key "${key}" not found!`);

      return original_key;
    });

  Object.entries(parsed).forEach(([key, value]) => {
    if (process.env[key] && process.env[key] !== value) {
      // continue
    } else if (EXPAND_REGEX.test(value)) {
      process.env[key] = all_envs[key] = expand(value);
    }
  });
}

export function loadAndReplaceEnvs(config_path: string) {
  const raw_process_env = Object.fromEntries(
    Object.entries(process.env).filter(([_, value]) => value !== null && value !== undefined) as [string, string][]
  );

  const parsed = loadConfig(config_path);
  replaceEnv(raw_process_env, parsed);
}
