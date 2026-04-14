import { CommonActions, createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { PlacePreview, RootStackParamList } from '../types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function pushLoginOnRoot(): boolean {
  if (!navigationRef.isReady()) {
    return false;
  }

  if (navigationRef.getCurrentRoute()?.name === 'Login') {
    return true;
  }

  navigationRef.dispatch(StackActions.push('Login'));
  return true;
}

export function resetToWelcomeOnRoot(): boolean {
  if (!navigationRef.isReady()) {
    return false;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    }),
  );

  return true;
}

export function openAddReportOnMap(place?: PlacePreview): boolean {
  if (!navigationRef.isReady()) {
    return false;
  }

  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'MainTabs',
      params: {
        screen: 'Map',
        params: {
          screen: 'AddReport',
          params: {
            place,
          },
        },
      },
    }),
  );

  return true;
}
