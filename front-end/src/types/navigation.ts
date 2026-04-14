import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type PlacePreview = {
  id: string;
  name?: string;
  image?: string;
  distance?: string;
  rating?: number;
  reviews?: number;
  tags?: string[];
};

export type ReportPreview = {
  id: string;
  name?: string;
  status?: string;
  statusColor?: string;
  statusBg?: string;
  time?: string;
  distance?: string;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string; token?: string } | undefined;
  MainTabs: undefined;
};

export type TabParamList = {
  Home: undefined;
  Map: undefined;
  Marketplace: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  PlaceDetails: { place?: PlacePreview; refreshToken?: number } | undefined;
  PublicPlaceDetails: { place: PlacePreview };
  WriteReview: { place?: PlacePreview } | undefined;
};

export type MapStackParamList = {
  MapMain: undefined;
  PlaceDetails: { place?: PlacePreview; refreshToken?: number } | undefined;
  WriteReview: { place?: PlacePreview } | undefined;
  AddReport:
    | {
        place?: PlacePreview;
      }
    | undefined;
  ReportDetails: { report?: ReportPreview } | undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  EditProfile: undefined;
  Favorites: undefined;
  Language: undefined;
  AccessibilitySettings: undefined;
  ChangePassword: undefined;
  PlaceDetails: { place?: PlacePreview; refreshToken?: number } | undefined;
  WriteReview: { place?: PlacePreview } | undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type HomeScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type MapScreenProps<T extends keyof MapStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<MapStackParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SettingsScreenProps<T extends keyof SettingsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type PlaceDetailsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'PlaceDetails'>,
  CompositeScreenProps<
    NativeStackScreenProps<MapStackParamList, 'PlaceDetails'>,
    CompositeScreenProps<
      NativeStackScreenProps<SettingsStackParamList, 'PlaceDetails'>,
      NativeStackScreenProps<RootStackParamList>
    >
  >
>;
