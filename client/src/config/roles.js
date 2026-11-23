export const roleLabels = {
  admin: 'Администратор',
  manager: 'Менеджер',
  user: 'Сотрудник',
};

export const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({ value, label }));
