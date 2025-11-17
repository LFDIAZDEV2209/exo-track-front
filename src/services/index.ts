// Central export for all services
export { authService } from './auth.service';
export { userService } from './user.service';
export { clientService } from './client.service';
export { declarationService } from './declaration.service';
export { incomeService } from './income.service';
export { assetService } from './asset.service';
export { liabilityService } from './liability.service';

// Export types
export type { LoginRequest, LoginResponse } from './auth.service';
export type { CreateDeclarationRequest, UpdateDeclarationRequest } from './declaration.service';
export type { CreateIncomeRequest } from './income.service';
export type { CreateAssetRequest } from './asset.service';
export type { CreateLiabilityRequest } from './liability.service';

