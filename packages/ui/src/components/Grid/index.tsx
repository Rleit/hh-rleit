// It is your job to implement this. More info in README

import * as React from 'react';
import { HexGrid, Layout, Hexagon, GridGenerator } from 'react-hexgrid';
import styled from 'styled-components';

import colormap from 'colormap';

const DepartmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(300px, 1fr));
  gap: 10em;

  @media (max-width: 768px) {
    width: 100%;
    margin-left: 2em;
    margin-right: 2em;
    display: grid;
    grid-template-columns: repeat(1, minmax(300px, 1fr));
    gap: 10em;
  }
`;

const DepartmentItem = styled.div`
  width: 350px;
  height: auto;
  @media (max-width: 768px) {
    min-width: unset;
  }
`;

const DepartmentTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  @media (max-width: 768px) {
    min-width: unset;
  }
`;
const DepartmentTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  @media (max-width: 768px) {
    min-width: unset;
  }
`;

interface IHexProps {
  i: number;
  q: number;
  r: number;
  s: number;
  value: number;
}

interface IGridProps {
  users: {
    id: number;
    department: {
      id: number;
      name: string;
    };
    risk?: number;
  }[];
}

const N_SHADES = 40;

let colors = colormap({
  colormap: 'jet',
  nshades: N_SHADES,
  format: 'hex',
  alpha: 1,
});

const DrawHex: React.FC<IHexProps> = props => {
  const colorIndex = Math.floor(props.value * N_SHADES);
  return (
    // React Hexagon "wiki" is actually empty

    <Hexagon
      key={props.i}
      q={props.q}
      r={props.r}
      s={props.s}
      cellStyle={{
        fill: colors[colorIndex],
      }}
    />
  );
};

export const Grid: React.FC<IGridProps> = ({ users }) => {
  if (!users) {
    return null;
  }

  const usersByDepartment = users.reduce((a, user) => {
    const deptId = user.department.id;
    if (!a[deptId]) {
      a[deptId] = {
        department: user.department,
        users: [],
      };
    }
    a[deptId].users.push(user);

    return a;
  }, {} as Record<number, { department: { id: number; name: string }; users: typeof users }>);

  // TODO Implement org based split
  // TODO Shape is pretty weird? and it will brake if data size changes, now it works as 101*114 = 11514
  // * Tried a scaling approach (user count , squared and brought up to the nearest number)
  // * but GridGenerator.hexagon generator at the moment fixes most of it

  return (
    <DepartmentGrid id='Grid'>
      {Object.values(usersByDepartment).map(
        ({ department, users: deptUsers }) => {
          // set grid based on number of users , squared to the nearest number
          // at this current implementation it will still squish down and look weird on smaller screens
          // but the structure stays intact
          const gridSize = Math.ceil(Math.sqrt(deptUsers.length));

          const hexagons = GridGenerator.hexagon(gridSize / 2);

          const Hexes = hexagons
            .slice(0, deptUsers.length)
            .map((hex, i) => (
              <DrawHex {...hex} i={i} value={deptUsers[i]?.risk || 0} />
            ));

          return (
            <DepartmentItem
              key={department.id}
              style={{ marginBottom: '20px' }}
            >
              <DepartmentTitleContainer>
                <DepartmentTitle>
                  <h4>Department</h4>
                  <h4>User count</h4>
                </DepartmentTitle>
                <DepartmentTitle>
                  <p>{department.name.toUpperCase()}</p>
                  <p>{deptUsers.length}</p>
                </DepartmentTitle>
              </DepartmentTitleContainer>

              <HexGrid
                width={400}
                height={400}
                viewBox={`0 0 ${gridSize * 2} ${gridSize * 2}`}
              >
                <Layout
                  size={{ x: 1, y: 1 }}
                  flat={true}
                  spacing={1.1}
                  origin={{ x: gridSize, y: gridSize }}
                >
                  {Hexes}
                </Layout>
              </HexGrid>

              <DepartmentTitleContainer>
                <h2>Highest Risk</h2>
                <DepartmentTitle>
                  <h3>User</h3>
                  <h3>Risk Score</h3>
                </DepartmentTitle>
                <DepartmentTitle>
                  <p>
                    {
                      deptUsers.reduce((highest, user) =>
                        (user.risk || 0) > (highest.risk || 0) ? user : highest,
                      ).id
                    }
                  </p>
                  <p>
                    {Math.max(...deptUsers.map(user => user.risk || 0)).toFixed(
                      2,
                    )}
                  </p>
                </DepartmentTitle>
              </DepartmentTitleContainer>
            </DepartmentItem>
          );
        },
      )}
    </DepartmentGrid>
  );
};
