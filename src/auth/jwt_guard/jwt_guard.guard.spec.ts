import { JwtAuthGuard } from "./jwt_guard.guard";

describe('JwtGuardGuard', () => {
  it('should be defined', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });
});
