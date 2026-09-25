import * as React from "react";
import Link from "next/link";
import { Grid, Horizontal } from "./utils/gls";

interface Props {
  years: string[];
}

export const ArchiveYears: React.FC<Props> = ({ years }) => {
  return (
    <Grid spacing={20} style={{ alignItems: "center" }}>
      {years.map((year) => (
        <Horizontal key={year} verticalAlign="center">
          <div style={{ fontSize: "2em" }}>
            <Link href={`/years/${year}`}>{year}</Link>
          </div>
          <div
            style={{
              backgroundColor: "#ddd",
              width: 10,
              height: 10,
              marginLeft: 20,
              borderRadius: "50%",
            }}
          />
        </Horizontal>
      ))}
    </Grid>
  );
};
