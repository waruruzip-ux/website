import type { Metadata } from "next";
import SafeJobApp from "./SafeJobApp";

export const metadata: Metadata = {
  title: "세이프잡 | 보건·안전 채용정보",
  description: "보건관리자와 안전관리자 채용공고를 한곳에서 검색하고 비교하세요.",
};

export default function Home() { return <SafeJobApp/>; }
