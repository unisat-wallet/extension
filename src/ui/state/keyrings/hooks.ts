import { AppState } from '..';
import { useAppSelector } from '../hooks';

export function useKeyringsState(): AppState['keyrings'] {
  return useAppSelector((state) => state.keyrings);
}

export function useKeyrings() {
  const keyringsState = useKeyringsState();
  return keyringsState.keyrings;
}

export function useCurrentKeyring() {
  const keyringsState = useKeyringsState();
  return keyringsState.current;
}
