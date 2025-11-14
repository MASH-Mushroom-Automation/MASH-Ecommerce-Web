# MASH Database Tables - JSON Structure Reference

Complete JSON structure files for all database tables in the MASH E-Commerce Platform.

## 📁 Folder Structure

```
data/tables/
├── core-ecommerce/        (7 files)
├── iot-devices/           (6 files)
├── alerts-notifications/  (8 files)
├── security-auth/         (4 files)
├── rbac/                  (4 files)
├── analytics/             (4 files)
├── import-export/         (3 files)
├── api-gateway/           (6 files)
└── system/                (3 files)
```

**Total: 45 JSON Structure Files**

---

## 📊 Core E-Commerce (7 files)

| File | Table | Description |
|------|-------|-------------|
| `user.json` | users | User accounts with authentication, 2FA, preferences |
| `product.json` | products | Products with pricing, inventory, soft deletes |
| `category.json` | categories | Category hierarchy with parent-child relationships |
| `order.json` | orders | Orders with addresses, tracking, complete lifecycle |
| `order-item.json` | order_items | Order line items with pricing and quantities |
| `address.json` | addresses | Philippines-format addresses (Barangay, Municipality, Province) |
| `payment.json` | payments | Payment transactions (GCash, Maya, COD, Bank Transfer) |

---

## 🔌 IoT Devices (6 files)

| File | Table | Description |
|------|-------|-------------|
| `device.json` | devices | IoT devices (chambers, sensors, controllers) |
| `sensor.json` | sensors | Individual sensors with calibration data |
| `sensor-data.json` | sensor_data | Time-series sensor readings |
| `device-command.json` | device_commands | Remote device commands with execution tracking |
| `sensor-alert.json` | sensor_alerts | Threshold-based sensor alerts |
| `device-health.json` | device_health | Device metrics (CPU, memory, network status) |

---

## 🔔 Alerts & Notifications (8 files)

| File | Table | Description |
|------|-------|-------------|
| `alert-rule.json` | alert_rules | Alert rule definitions with conditions |
| `alert-rule-recipient.json` | alert_rule_recipients | Multi-channel recipient configuration |
| `alert.json` | alerts | Alert instances with deduplication |
| `notification.json` | notifications | Delivery records with retry logic |
| `alert-acknowledgment.json` | alert_acknowledgments | Alert action history |
| `notification-template.json` | notification_templates | Reusable templates with variables |
| `alert-escalation-policy.json` | alert_escalation_policies | Auto-escalation rules |
| `user-notification.json` | user_notifications | In-app notification system |

---

## 🔐 Security & Auth (4 files)

| File | Table | Description |
|------|-------|-------------|
| `session.json` | sessions | Session management with Clerk integration |
| `api-key.json` | api_keys | API keys with scoped permissions |
| `security-log.json` | security_logs | Security event logging |
| `rate-limit-log.json` | rate_limit_logs | Rate limiting tracking |

---

## 👥 RBAC (Role-Based Access Control) (4 files)

| File | Table | Description |
|------|-------|-------------|
| `permission.json` | permissions | Resource-action permissions (products:read, orders:write) |
| `role.json` | roles | System and custom roles |
| `user-role-assignment.json` | user_role_assignments | User-to-role mappings |
| `role-permission.json` | role_permissions | Role-to-permission mappings |

---

## 📈 Analytics (4 files)

| File | Table | Description |
|------|-------|-------------|
| `report.json` | reports | Report definitions with configuration and scheduling |
| `report-execution.json` | report_executions | Report execution logs with results |
| `report-subscription.json` | report_subscriptions | User subscriptions to automated reports |
| `search-log.json` | search_logs | Search analytics for user queries |

---

## 📥 Import/Export (3 files)

| File | Table | Description |
|------|-------|-------------|
| `import-export-job.json` | import_export_jobs | Bulk import/export job tracking with progress |
| `import-export-error.json` | import_export_errors | Error details for failed records |
| `import-export-template.json` | import_export_templates | Reusable templates for import/export operations |

---

## 🌐 API Gateway (6 files)

| File | Table | Description |
|------|-------|-------------|
| `api-gateway-config.json` | api_gateway_configs | API Gateway routing and load balancing configuration |
| `rate-limit-override.json` | rate_limit_overrides | Custom rate limits for specific users or API keys |
| `api-usage-log.json` | api_usage_logs | API request analytics and usage tracking |
| `request-queue.json` | request_queues | Queue for throttled API requests |
| `api-version-usage.json` | api_version_usages | API version adoption tracking |
| `circuit-breaker-state.json` | circuit_breaker_states | Circuit breaker state for fault tolerance |

---

## ⚙️ System (3 files)

| File | Table | Description |
|------|-------|-------------|
| `system-config.json` | system_configs | System-wide configuration settings |
| `audit-log.json` | audit_logs | Comprehensive audit trail for all system actions |
| `push-subscription.json` | push_subscriptions | Web Push notification subscriptions |

---

## 📝 JSON File Format

Each JSON file includes:

- **`_comment`**: Table name and description
- **`_table`**: Database table name
- **`_description`**: Purpose of the table
- **`_schema_reference`**: Location of Prisma schema
- **`_required_fields`**: List of required fields
- **`_optional_fields`**: List of optional fields
- **`_relationships`**: Related tables and relationship types
- **`_enums`**: Enum values for fields (all UPPERCASE to match backend)
- **`_notes`**: Field explanations and usage notes
- **Example records**: Realistic Philippine-specific data

---

## 🎯 Usage

These JSON files serve as:

1. **API Response Templates** - Expected data structures from backend
2. **Frontend Type Definitions** - TypeScript interface generation
3. **Database Seeding** - Test data for development
4. **Documentation** - Complete schema reference with examples
5. **Validation** - Field requirements and enum values

---

## 🔗 Related Documentation

- **Prisma Schema**: `MASH-Backend/prisma/schema.prisma`
- **API Integration Guide**: `documents/API_IMPLEMENTATION_GUIDE.md`
- **Backend Schema Reference**: `docs/SCHEMA_REFERENCE.md`
- **Complete Architecture**: `docs/COMPLETE_ARCHITECTURE.md`

---

## ⚠️ Important Notes

### Enum Format
- **Backend uses UPPERCASE**: `"PENDING"`, `"COMPLETED"`, `"CASH_ON_DELIVERY"`
- **Frontend sometimes uses lowercase**: Ensure proper case conversion in API integration

### ID Formats
- **Most tables**: CUID (e.g., `cm3vxyz123456789`)
- **Alert system**: UUID (e.g., `550e8400-e29b-41d4-a716-446655440000`)

### Philippine-Specific Data
- **Addresses**: Barangay, Municipality, Province format
- **Phone**: +63 prefix (e.g., `+639171234567`)
- **Payment Methods**: GCash, Maya, Cash on Delivery, Bank Transfer
- **Timezone**: Asia/Manila (UTC+8)

---

**Generated**: 2025-11-10  
**Schema Version**: Based on MASH-Backend/prisma/schema.prisma  
**Total Tables**: 45
