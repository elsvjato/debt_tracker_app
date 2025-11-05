import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../../theme/styles';
import { useTheme } from '../../theme/useTheme';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightComponent,
  showBackButton = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={showBackButton ? globalStyles.headerRowWithBack : globalStyles.headerRow}>
      {showBackButton && onBack && (
        <TouchableOpacity onPress={onBack} style={globalStyles.backButton}>
          <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
      
      <Text 
        style={showBackButton ? globalStyles.headerTitleWithBack : globalStyles.headerTitle}
        numberOfLines={1}
      >
        {title}
      </Text>
      
      {rightComponent && (
        <View style={globalStyles.backButton}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

export default Header; 