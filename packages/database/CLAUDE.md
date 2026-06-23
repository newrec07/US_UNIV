# Database package

Prisma schema, migration, database client를 소유한다.

- 도메인 타입을 기준으로 영속 모델을 파생한다.
- Agent Worker에 database client를 노출하지 않는다.
- 객관적 공유 엔티티와 학생별 관계 데이터를 분리한다.
- migration은 기존 데이터 보존과 되돌리기 전략을 함께 검토한다.
- 민감 원본 문서는 일반 테이블 필드에 저장하지 않는다.
