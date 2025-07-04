import Review from '../models/Review';

// Utility function to add careAddressData to user response
export const addCareAddressData = (userResponse: any) => {
  if (userResponse.carerConfig?.careAddress && userResponse.addresses) {
    const careAddress = userResponse.addresses.find(
      (address: any) =>
        address._id?.toString() ===
        userResponse.carerConfig?.careAddress?.toString()
    );

    if (careAddress) {
      userResponse.carerConfig.careAddressData = careAddress;
    }
  }
  return userResponse;
};

// Utility function to add average review data to a single user object
export const addAverageReviewsToUser = async (userData: any) => {
  const userReviewsAsUser = await (Review as any).getAverageRatingAsUser(
    userData.id
  );
  const userReviewsAsCaregiver = await (
    Review as any
  ).getAverageRatingAsCaregiver(userData.id);

  const userWithReviews = {
    ...userData,
    reviews: {
      averageRatingAsUser: userReviewsAsUser.averageRating,
      totalReviewsAsUser: userReviewsAsUser.totalReviews,
      averageRatingAsCaregiver: userReviewsAsCaregiver.averageRating,
      totalReviewsAsCaregiver: userReviewsAsCaregiver.totalReviews,
    },
  };

  return userWithReviews;
};
