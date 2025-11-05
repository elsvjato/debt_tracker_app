
// Commented out to always show onboarding
// export const resetOnboarding = async () => {
//   try {
//     await AsyncStorage.removeItem('onboardingComplete');
//     console.log('Onboarding reset successfully');
//   } catch (error) {
//     console.error('Error resetting onboarding:', error);
//   }
// };

// export const checkOnboardingStatus = async () => {
//   try {
//     const status = await AsyncStorage.getItem('onboardingComplete');
//     console.log('Onboarding status:', status);
//     return status === 'true';
//   } catch (error) {
//     console.error('Error checking onboarding status:', error);
//     return false;
//   }
// }; 