// Utility function to add careAddressData to user response
export const addCareAddressData = (userResponse: any) => {
  if (userResponse.carerConfig?.careAddress && userResponse.addresses) {
    const careAddress = userResponse.addresses.find(
      (address: any) => address._id?.toString() === userResponse.carerConfig?.careAddress?.toString()
    );
    
    if (careAddress) {
      userResponse.careAddressData = careAddress;
    }
  }
  return userResponse;
}; 