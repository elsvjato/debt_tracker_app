import React from 'react';
import { Text, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import { globalStyles } from '../../theme/styles';
import { useTheme } from '../../theme/useTheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    let buttonStyle: ViewStyle = { ...globalStyles.button };
    
    switch (variant) {
      case 'secondary':
        buttonStyle = { ...globalStyles.buttonSecondary };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
          borderRadius: globalStyles.button.borderRadius,
          paddingVertical: globalStyles.button.paddingVertical,
          alignItems: 'center',
        };
        break;
      case 'danger':
        buttonStyle = {
          ...globalStyles.button,
          backgroundColor: colors.error,
        };
        break;
    }
    
    if (fullWidth) {
      buttonStyle.width = '100%';
    }
    
    if (size === 'small') {
      buttonStyle.paddingVertical = 8;
    } else if (size === 'large') {
      buttonStyle.paddingVertical = 16;
    }
    
    return buttonStyle;
  };

  const getTextStyle = (): TextStyle => {
    let textStyle: TextStyle = { ...globalStyles.buttonText };
    
    switch (variant) {
      case 'secondary':
      case 'outline':
        textStyle = { ...globalStyles.buttonTextSecondary };
        break;
      case 'danger':
        textStyle = { 
          ...globalStyles.buttonText,
          color: colors.textPrimary 
        };
        break;
    }
    
    if (size === 'small') {
      textStyle.fontSize = 14;
    } else if (size === 'large') {
      textStyle.fontSize = 18;
    }
    
    return textStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button; 