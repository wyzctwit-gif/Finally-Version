import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Publish from '../views/Publish.vue';
import OrderList from '../views/OrderList.vue';
import OrderDetail from '../views/OrderDetail.vue';
import MyOrders from '../views/MyOrders.vue';
import Admin from '../views/Admin.vue';
import Status from '../views/Status.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/publish',
    name: 'Publish',
    component: Publish
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: OrderList
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail
  },
  {
    path: '/my-orders',
    name: 'MyOrders',
    component: MyOrders
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  },
  {
    path: '/status',
    name: 'Status',
    component: Status
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
