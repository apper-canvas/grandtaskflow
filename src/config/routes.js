import Tasks from '@/components/pages/Tasks';
import Contacts from '@/components/pages/Contacts';
import Deals from '@/components/pages/Deals';
import Discounts from '@/components/pages/Discounts';

export const routes = {
  tasks: {
    id: 'tasks',
    label: 'Tasks',
    path: '/',
    icon: 'CheckSquare',
    component: Tasks
  },
  contacts: {
    id: 'contacts',
    label: 'Contacts',
    path: '/contacts',
    icon: 'Users',
    component: Contacts
  },
  deals: {
    id: 'deals',
    label: 'Deals',
    path: '/deals',
    icon: 'Briefcase',
    component: Deals
  },
  discounts: {
    id: 'discounts',
    label: 'Discounts',
    path: '/discounts',
    icon: 'Tag',
    component: Discounts
  }
};

export const routeArray = Object.values(routes);
export default routes;