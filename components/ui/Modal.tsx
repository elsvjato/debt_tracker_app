import React from 'react';
import { ModalProps, Modal as RNModal, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { globalStyles } from '../../theme/styles';
import { useTheme } from '../../theme/useTheme';

interface CustomModalProps extends ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  variant?: 'center' | 'bottom';
}

export const Modal: React.FC<CustomModalProps> = ({
  title,
  children,
  onClose,
  showCloseButton = true,
  variant = 'center',
  ...props
}) => {
  const { colors } = useTheme();

  const getModalContentStyle = (): ViewStyle => {
    let modalStyle: ViewStyle = { ...globalStyles.modalContent };
    
    if (variant === 'bottom') {
      modalStyle = {
        ...globalStyles.modalContent,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        justifyContent: 'flex-end',
        maxHeight: '80%',
      };
    }
    
    return modalStyle;
  };

  return (
    <RNModal
      transparent
      animationType="fade"
      {...props}
    >
      <View style={globalStyles.modalOverlay}>
        <View style={getModalContentStyle()}>
          {title && (
            <Text style={[globalStyles.modalTitle, { color: colors.textPrimary }]}>
              {title}
            </Text>
          )}
          
          {children}
          
          {showCloseButton && onClose && (
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>
                Close
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    borderWidth: 2,
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default Modal; 