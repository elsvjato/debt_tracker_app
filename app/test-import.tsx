import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../i18n/useTranslation';

export default function TestTranslation() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест перекладів</Text>
      
      <Text style={styles.section}>Базові переклади:</Text>
      <Text>Home: {t('home')}</Text>
      <Text>Contacts: {t('contacts')}</Text>
      <Text>Profile: {t('profile')}</Text>
      
      <Text style={styles.section}>Вкладені переклади:</Text>
      <Text>PERSONAL_INFO.TITLE: {t('PERSONAL_INFO.TITLE')}</Text>
      <Text>PERSONAL_INFO.FIRST_NAME: {t('PERSONAL_INFO.FIRST_NAME')}</Text>
      <Text>ADD_EVENT.TITLE: {t('ADD_EVENT.TITLE')}</Text>
      <Text>CONTACTS.TITLE: {t('CONTACTS.TITLE')}</Text>
      <Text>PROFILE.TITLE: {t('PROFILE.TITLE')}</Text>
      <Text>ABOUT.TITLE: {t('ABOUT.TITLE')}</Text>
      <Text>FAQ.TITLE: {t('FAQ.TITLE')}</Text>
      <Text>HELP.TITLE: {t('HELP.TITLE')}</Text>
      <Text>EVENT_DETAILS.TITLE: {t('EVENT_DETAILS.TITLE')}</Text>
      <Text>ADD_CONTACT.TITLE: {t('ADD_CONTACT.TITLE')}</Text>
      <Text>CONTACT_DETAILS.TITLE: {t('CONTACT_DETAILS.TITLE')}</Text>
      <Text>ADD_EXPENSE.TITLE: {t('ADD_EXPENSE.TITLE')}</Text>
      <Text>CATEGORIES.GENERAL: {t('CATEGORIES.GENERAL')}</Text>
      <Text>TERMS.TITLE: {t('TERMS.TITLE')}</Text>
      <Text>EDIT_EVENT.TITLE: {t('EDIT_EVENT.TITLE')}</Text>
      <Text>EDIT_EXPENSE.TITLE: {t('EDIT_EXPENSE.TITLE')}</Text>
      <Text>EDIT_GROUP.TITLE: {t('EDIT_GROUP.TITLE')}</Text>
      <Text>EXPENSE_DETAILS.TITLE: {t('EXPENSE_DETAILS.TITLE')}</Text>
      
      <Text style={styles.section}>Категорії витрат:</Text>
      <Text>expenseCategories.general: {t('expenseCategories.general')}</Text>
      <Text>expenseCategories.food: {t('expenseCategories.groceries')}</Text>
      <Text>expenseCategories.transport: {t('expenseCategories.transport')}</Text>
      
      <Text style={styles.section}>Категорії груп:</Text>
      <Text>groupCategories.trip: {t('groupCategories.trip')}</Text>
      <Text>groupCategories.family: {t('groupCategories.family')}</Text>
      <Text>groupCategories.couple: {t('groupCategories.couple')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
}); 