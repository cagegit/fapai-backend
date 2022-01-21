import { DefaultFooter } from '@ant-design/pro-layout';
export default () => {
  const defaultMessage = 'Al-Cage';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'goods manger',
          title: '货品管理系统',
          href: '#',
          blankTarget: true,
        },
      ]}
    />
  );
};
