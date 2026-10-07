import type { CSSProperties } from "react";
import styles from "../styles/Skeleton.module.css";

type SkeletonProps = {
  largura?: CSSProperties["width"];
  altura?: CSSProperties["height"];
  className?: string;
};

export function Skeleton({ largura = "100%", altura = "1rem", className }: SkeletonProps) {
  return <span aria-hidden="true" className={[styles.skeleton, className].filter(Boolean).join(" ")} style={{ width: largura, height: altura }} />;
}
