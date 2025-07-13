import { buildSchema } from 'graphql';
import { User } from '../handlers/db/users/models';
import { Context } from '../types/global';

export const graphQLSchema = buildSchema(`

  type Department {
    id: ID!
    name: String!
    users: [User!] 
  }

  type User {
    id: ID!
    risk: Float
    department: Department!
  }

  type Query {
    users: [User!]!
    departments: [Department!]!
    
  }
`);

//* Currently unused as UI changed to department -> user query.
//* An improvement over the original query since original queries database for department on each user
const addUserResolvers = (ctx: Context) => async (users: User[]) => {
  // Get department IDs
  const departmentIds = [...new Set(users.map(user => user.departmentId))];

  // Batch load all departments at once.
  const departments = await ctx.handlers.db.department.getByIds(ctx, {
    ids: departmentIds,
  });
  const departmentMap = new Map(departments.map(dept => [dept.id, dept]));

  return users.map(user =>
    Object.assign(user, {
      department: departmentMap.get(user.departmentId),
    }),
  );
};

const addDepartmentResolvers = (ctx: Context) => async (departments: any[]) => {
  // TODO: Should really be just one Join query
  // Get all users for these departments
  const users = await ctx.handlers.db.user.getAll(ctx, {});
  const usersByDept = users.reduce((a, user) => {
    if (!a[user.departmentId]) a[user.departmentId] = [];
    a[user.departmentId].push(user);
    return a;
  }, {} as Record<string, User[]>);

  return departments.map(dept =>
    Object.assign(dept, {
      users: usersByDept[dept.id] || [],
    }),
  );
};

export const createResolvers = (ctx: Context) => ({
  users: () => ctx.handlers.db.user.getAll(ctx, {}).then(addUserResolvers(ctx)),
  departments: () =>
    ctx.handlers.db.department
      .getAll(ctx, {})
      .then(addDepartmentResolvers(ctx)),
});
