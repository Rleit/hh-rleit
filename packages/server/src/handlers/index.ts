import { get } from 'http';
import { Context } from '../types/global';
import {
  getById as getDepartmentById,
  getByIds as getDepartmentsByIds,
} from './db/departments/getDepartmentById';
import { getAll as getAllDepartments } from './db/departments/getAll';
import { getAll as getAllUsers } from './db/users/getAll';

// Add functions here to extend Context.handlers.
export const handlerTree = {
  db: {
    department: {
      getById: getDepartmentById,
      getByIds: getDepartmentsByIds,
      getAll: getAllDepartments,
    },
    user: {
      getAll: getAllUsers,
    },
  },
};

export const withHandlerTree = (ctx: Omit<Context, 'handlers'>): Context => ({
  ...ctx,
  handlers: handlerTree,
});
