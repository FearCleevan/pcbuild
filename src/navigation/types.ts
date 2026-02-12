export type RootTabParamList = {
  Home: undefined;
  Build: undefined;
  Explore: undefined;
  Profile: undefined;
};

export type ExploreStackParamList = {
  ExploreMain: undefined;
  CompareReview: {
    compareIds: string[];
  };
  ProductDetails: {
    productId: string;
  };
};
