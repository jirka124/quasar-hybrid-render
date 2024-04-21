const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "index",
        component: () => import("pages/IndexPage.vue"),
      },
      {
        path: "ssr",
        name: "ssr",
        component: () => import("pages/SSRPage.vue"),
      },
      {
        path: "csr",
        name: "csr",
        component: () => import("pages/CSRPage.vue"),
      },
      {
        path: "ssg",
        name: "ssg",
        component: () => import("pages/SSGPage.vue"),
      },
      {
        path: "isr",
        name: "isr",
        component: () => import("pages/ISRPage.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
