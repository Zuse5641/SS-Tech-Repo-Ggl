# Firebase Security Specification - SS Care Technology

## Data Invariants
1. A repair request lead cannot exist without a valid customer name, valid phone number, Bangalore locality, device category, and repair issue.
2. Only authorized administrators and assigned technicians can update repair states, diagnosis details, and invoice records.
3. Customers can track their own repair requests via unique Request ID without having to be forced into complex OAuth signups.
4. Technicians can only update jobs assigned to their technician ID or accept available dispatches.
5. Critical business configuration (pricing, settings, technician profiles) requires admin privileges.
6. Public visitors can create new leads and read public catalogs (brands, models, issues, areas, reviews, and FAQs).

## RBAC Roles
- **Admin**: Full read & write on all collections (`leads`, `settings`, `technicians`, `services`, `reviews`, `faqs`, `invoices`, `warranties`).
- **Technician**: Read assigned jobs in `leads`, update `jobStatus`, `serviceOtp`, `diagnosisNotes`, `beforePhotos`, `afterPhotos`.
- **Customer / Guest**: Create new `leads`, read own repair status by `requestId`, read public catalogs.
