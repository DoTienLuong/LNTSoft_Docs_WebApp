------------------------------------------------------------
-- 1. TẠO DATABASE
------------------------------------------------------------
IF DB_ID(N'guidebook_fullstack') IS NULL
BEGIN
    CREATE DATABASE [guidebook_fullstack];
END;
GO

USE [guidebook_fullstack];
GO




------------------------------------------------------------
-- 2. XÓA BẢNG NẾU ĐÃ TỒN TẠI (ĐÚNG THỨ TỰ PHỤ THUỘC)
------------------------------------------------------------
IF OBJECT_ID(N'dbo.content_history', N'U') IS NOT NULL
    DROP TABLE dbo.content_history;
IF OBJECT_ID(N'dbo.content_images', N'U') IS NOT NULL
    DROP TABLE dbo.content_images;
IF OBJECT_ID(N'dbo.media_files', N'U') IS NOT NULL
    DROP TABLE dbo.media_files;
IF OBJECT_ID(N'dbo.contents', N'U') IS NOT NULL
    DROP TABLE dbo.contents;
IF OBJECT_ID(N'dbo.categories', N'U') IS NOT NULL
    DROP TABLE dbo.categories;
IF OBJECT_ID(N'dbo.users', N'U') IS NOT NULL
    DROP TABLE dbo.users;
IF OBJECT_ID(N'dbo.modules', N'U') IS NOT NULL
    DROP TABLE dbo.modules;
GO

IF OBJECT_ID(N'dbo.ModuleIdSeq', N'SO') IS NOT NULL
    DROP SEQUENCE dbo.ModuleIdSeq;
GO

------------------------------------------------------------
-- 3. BẢNG modules
------------------------------------------------------------
CREATE SEQUENCE dbo.ModuleIdSeq
    AS INT
    START WITH 1
    INCREMENT BY 1;
GO

CREATE TABLE [dbo].[modules] (
    [moduleID] NVARCHAR(10) NOT NULL
        CONSTRAINT DF_modules_moduleID
        DEFAULT ('MD' + RIGHT('000' + CAST(NEXT VALUE FOR dbo.ModuleIdSeq AS VARCHAR(10)), 3)),
    [moduleName]             NVARCHAR(100)  NOT NULL,
    [icon]             NVARCHAR(50)   NULL,
    [order_index]      INT            NOT NULL CONSTRAINT DF_modules_order_index DEFAULT (0),
    [active]        BIT            NOT NULL CONSTRAINT DF_modules_is_active DEFAULT (1),
    [create_update_at] DATETIME2      NULL CONSTRAINT DF_modules_create_update_at DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_modules PRIMARY KEY CLUSTERED ([moduleID] ASC)
);
GO

------------------------------------------------------------
-- 4. BẢNG users
------------------------------------------------------------
CREATE TABLE [dbo].[users] (
    [id]                  INT            NOT NULL IDENTITY(1,1),
    [username]            NVARCHAR(50)   NOT NULL,
    [email]               NVARCHAR(100)  NOT NULL,
    [password_hash]       NVARCHAR(255)  NOT NULL,
    [role]                NVARCHAR(20)   NOT NULL CONSTRAINT DF_users_role DEFAULT (N'customer'),
    [is_active]           BIT            NOT NULL CONSTRAINT DF_users_is_active DEFAULT (1),
    [token_version]       INT            NOT NULL CONSTRAINT DF_users_token_version DEFAULT (0),
    [last_login_at]       DATETIME2      NULL,
    [password_changed_at] DATETIME2      NULL,
    [create_update_at]    DATETIME2      NULL CONSTRAINT DF_users_create_update_at DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_users PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT UQ_users_username UNIQUE ([username]),
    CONSTRAINT UQ_users_email UNIQUE ([email]),
    CONSTRAINT CK_users_role CHECK ([role] IN (N'admin', N'manager', N'customer'))
);
GO

------------------------------------------------------------
-- 5. BẢNG categories
------------------------------------------------------------
CREATE TABLE [dbo].[categories] (
    [id]               INT            NOT NULL IDENTITY(1,1),
    [module_id]        NVARCHAR(10)  NOT NULL,
    [parent_id]        INT            NULL,
    [title]            NVARCHAR(200)  NOT NULL,
    [description]      NVARCHAR(MAX)  NULL,
    [order_index]      INT            NOT NULL CONSTRAINT DF_categories_order_index DEFAULT (0),
    [is_active]        BIT            NOT NULL CONSTRAINT DF_categories_is_active DEFAULT (1),
    [create_update_at] DATETIME2      NULL CONSTRAINT DF_categories_create_update_at DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_categories PRIMARY KEY CLUSTERED ([id] ASC),
    -- Giữ cascade với modules
    CONSTRAINT FK_categories_modules FOREIGN KEY ([module_id])
        REFERENCES [dbo].[modules]([moduleID]) ON DELETE CASCADE,
    -- BỎ CASCADE ở self-reference để tránh multiple cascade paths
    CONSTRAINT FK_categories_parent FOREIGN KEY ([parent_id])
        REFERENCES [dbo].[categories]([id])
);
GO

CREATE NONCLUSTERED INDEX IX_categories_parent_id
    ON [dbo].[categories]([parent_id]);
GO

CREATE NONCLUSTERED INDEX IX_categories_module_order
    ON [dbo].[categories]([module_id], [order_index]);
GO

------------------------------------------------------------
-- 6. BẢNG contents
------------------------------------------------------------
CREATE TABLE [dbo].[contents] (
    [id]               INT            NOT NULL IDENTITY(1,1),
    [category_id]      INT            NOT NULL,
    [parent_id]        INT            NULL,
    [title]            NVARCHAR(300)  NOT NULL,
    [html_content]     NVARCHAR(MAX)  NULL,
    [plain_content]    NVARCHAR(MAX)  NULL,
    [is_published]     BIT            NOT NULL CONSTRAINT DF_contents_is_published DEFAULT (1),
    [view_count]       INT            NOT NULL CONSTRAINT DF_contents_view_count DEFAULT (0),
    [order_index]      INT            NULL,
    [create_update_at] DATETIME2      NULL CONSTRAINT DF_contents_create_update_at DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_contents PRIMARY KEY CLUSTERED ([id] ASC),
    -- CASCADE khi xóa category => xóa contents
    CONSTRAINT FK_contents_categories FOREIGN KEY ([category_id])
        REFERENCES [dbo].[categories]([id]) ON DELETE CASCADE,
    -- BỎ CASCADE ở self-reference để tránh multiple cascade paths
    CONSTRAINT FK_contents_parent FOREIGN KEY ([parent_id])
        REFERENCES [dbo].[contents]([id])
);
GO

CREATE NONCLUSTERED INDEX IX_contents_category_published
    ON [dbo].[contents]([category_id], [is_published]);
GO

CREATE NONCLUSTERED INDEX IX_contents_parent
    ON [dbo].[contents]([parent_id]);
GO

------------------------------------------------------------
-- 7. BẢNG media_files
------------------------------------------------------------
CREATE TABLE [dbo].[media_files] (
    [id]               INT            NOT NULL IDENTITY(1,1),
    [content_id]       INT            NULL,
    [filename]         NVARCHAR(255)  NOT NULL,
    [original_name]    NVARCHAR(255)  NOT NULL,
    [file_path]        NVARCHAR(500)  NOT NULL,
    [file_size]        INT            NULL,
    [file_type]        NVARCHAR(100)  NULL,
    [is_active]        BIT            NOT NULL CONSTRAINT DF_media_files_is_active DEFAULT (1),
    [create_update_at] DATETIME2      NULL CONSTRAINT DF_media_files_create_update_at DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_media_files PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT FK_media_files_contents FOREIGN KEY ([content_id])
        REFERENCES [dbo].[contents]([id]) ON DELETE SET NULL
);
GO

CREATE NONCLUSTERED INDEX IX_media_files_content_is_active
    ON [dbo].[media_files]([content_id], [is_active]);
GO

------------------------------------------------------------
-- 8. BẢNG content_history
------------------------------------------------------------
CREATE TABLE [dbo].[content_history] (
    [id]           INT            NOT NULL IDENTITY(1,1),
    [content_id]   INT            NOT NULL,
    [user_id]      INT            NULL,
    [title]        NVARCHAR(300)  NULL,
    [html_content] NVARCHAR(MAX)  NULL,
    [change_note]  NVARCHAR(500)  NULL,
    [created_at]   DATETIME2      NULL CONSTRAINT DF_content_history_created_at DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_content_history PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT FK_content_history_contents FOREIGN KEY ([content_id])
        REFERENCES [dbo].[contents]([id]) ON DELETE CASCADE,
    CONSTRAINT FK_content_history_users FOREIGN KEY ([user_id])
        REFERENCES [dbo].[users]([id]) ON DELETE SET NULL
);
GO

CREATE NONCLUSTERED INDEX IX_content_history_user_id
    ON [dbo].[content_history]([user_id]);
GO

CREATE NONCLUSTERED INDEX IX_content_history_content_created
    ON [dbo].[content_history]([content_id], [created_at]);
GO

------------------------------------------------------------
-- 9. BẢNG content_images
------------------------------------------------------------
CREATE TABLE [dbo].[content_images] (
    [id]               INT            NOT NULL IDENTITY(1,1),
    [content_id]       INT            NULL,
    [image_url]        NVARCHAR(500)  NULL,
    [caption]          NVARCHAR(255)  NULL,
    [order_index]      INT            NOT NULL CONSTRAINT DF_content_images_order_index DEFAULT (0),
    [create_update_at] DATETIME2      NULL CONSTRAINT DF_content_images_create_update_at DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_content_images PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT FK_content_images_contents FOREIGN KEY ([content_id])
        REFERENCES [dbo].[contents]([id]) ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_content_images_content_id
    ON [dbo].[content_images]([content_id]);
GO


USE [guidebook_fullstack];
GO

INSERT INTO [dbo].[modules] (
    [moduleName],
    [icon],
    [order_index],
    [active]
)
VALUES
    ('Organization',          'fas fa-building',         1,  1),
    ('System',                'fas fa-cogs',             2,  1),
    ('Finance',               'fas fa-dollar-sign',      3,  1),
    ('Costing',               'fas fa-calculator',       4,  1),
    ('Product Sampling',      'fas fa-vials',            5,  1),
    ('Order Management',      'fas fa-shopping-cart',    6,  1),
    ('Planning',              'fas fa-project-diagram',  7,  1),
    ('Material Management',   'fas fa-boxes',            8,  1),
    ('Inventory',             'fas fa-warehouse',        9,  1),
    ('Production',           'fas fa-industry',         10, 1),
    ('Quality',              'fas fa-check-circle',     11, 1),
    ('Sales and Distribution','fas fa-truck',           12, 1),
    ('MI Reports',           'fas fa-chart-bar',        13, 1),
    ('Configuration',        'fas fa-tools',            14, 1),
    ('Help',                 'fas fa-question-circle',  15, 1),
    ('Test Management',      'fas fa-users',            16, 1);
GO



USE [guidebook_fullstack];
GO

SET IDENTITY_INSERT [dbo].[categories] ON;
GO

INSERT INTO [dbo].[categories] (
    [id],
    [module_id],
    [parent_id],
    [title],
    [description],
    [order_index],
    [is_active]
)
VALUES
    (1,  'MD001',  NULL, 'Company Information',                'Manage organization company details',                          2,  1),
    (2,  'MD001',  NULL, 'Work Calendarsadsasd',               'Setup and manage organization work calendar',                  1,  1),
    (3,  'MD002',  NULL, 'Exchange Rate',                      'Manage exchange rates',                                        1,  1),
    (4,  'MD002',  NULL, 'UOM Conversion',                     'Unit of Measure conversion setup',                             2,  1),
    (5,  'MD002',  NULL, 'Warehouse Location Details',         'Setup warehouse locations',                                    3,  1),
    (6,  'MD002',  NULL, 'Master Attribute Values',            'Manage master attribute values',                               4,  1),
    (7,  'MD002',  NULL, 'Attribute Value Link',               'Link attribute values',                                        5,  1),
    (8,  'MD002',  NULL, 'Service Attribute Values',           'Manage service attribute values',                              6,  1),
    (9,  'MD002',  NULL, 'Size Chart',                         'Setup size chart details',                                     7,  1),
    (10, 'MD002',  NULL, 'Color Chart',                        'Setup color chart details',                                    8,  1),
    (11, 'MD002',  NULL, 'Product Item Mgmt.',                 'Manage product items',                                         9,  1),
    (12, 'MD002',  NULL, 'FG Item Mgmt.',                      'Manage finished goods items',                                  10, 1),
    (13, 'MD002',  NULL, 'Material Item Mgmt.',                'Manage material items',                                        11, 1),
    (14, 'MD002',  NULL, 'WH BIN Location Detail',             'Warehouse BIN location details',                               12, 1),
    (15, 'MD002',  NULL, 'Work Notes - FO',                    'Manage FO work notes',                                         13, 1),
    (16, 'MD003',  NULL, 'Currency',                           'Manage currency settings',                                     1,  1),
    (17, 'MD003',  NULL, 'Customer Detail',                    'Manage customer financial details',                            2,  1),
    (18, 'MD003',  NULL, 'Vendor Detail',                      'Manage vendor financial details',                              3,  1),
    (19, 'MD003',  NULL, 'Vendor Group',                       'Manage vendor grouping',                                       4,  1),
    (20, 'MD004',  NULL, 'Target Costing',                     'Manage target costing for orders',                             1,  1),
    (21, 'MD004',  NULL, 'Order Budget Plan',                  'Plan budget for orders',                                       2,  1),
    (22, 'MD004',  NULL, 'Order Costing',                      'Manage detailed order costing',                                3,  1),
    (23, 'MD005',  NULL, 'Style Sampling Management',          'Manage style sampling activities',                             1,  1),
    (24, 'MD005',  NULL, 'Style Wash Cycle Process',           'Handle wash cycle process for samples',                        2,  1),
    (25, 'MD005',  NULL, 'Sample Work Order Ack.',             'Acknowledge sample work orders',                               3,  1),
    (26, 'MD005',  NULL, 'Sample Work Order Execution',        'Execute sample work orders',                                   4,  1),
    (27, 'MD005',  NULL, 'Track Sample Prod. Status',          'Track production status of samples',                           5,  1),
    (28, 'MD005',  NULL, 'Internal QC Inspection',             'Perform internal quality inspection for samples',              6,  1),
    (29, 'MD005',  NULL, 'Sample Dispatching',                 'Manage sample dispatching process',                            7,  1),
    (30, 'MD005',  NULL, 'Sample Feedback And Approvals',      'Handle feedback and approvals for samples',                    8,  1),
    (31, 'MD005',  NULL, 'Sample Status Tracking',             'Track status of samples',                                      9,  1),
    (32, 'MD005',  NULL, 'Sampling Material Detail',           'Manage sampling material details',                             10, 1),
    (33, 'MD005',  NULL, 'Sampling Material Purchases',        'Manage purchases of sampling materials',                       11, 1),
    (34, 'MD005',  NULL, 'Sampling Material PO',               'Manage purchase orders for sampling materials',                12, 1),
    (35, 'MD005',  NULL, 'Sampling Material Receipt',          'Track receipt of sampling materials',                          13, 1),
    (36, 'MD005',  NULL, 'Sampling Material Issues',           'Track issues related to sampling materials',                   14, 1),
    (37, 'MD006',  NULL, 'Block Order',                        'Manage block orders',                                          1,  1),
    (38, 'MD006',  NULL, 'Block Order End',                    'Enter details for block orders',                               2,  1),
    (39, 'MD006',  NULL, 'Forecast Order Management',          'Handle forecast order management',                             3,  1),
    (40, 'MD006',  NULL, 'Order Program',                      'Manage order programs',                                        4,  1),
    (41, 'MD006',  NULL, 'Confirmed Order Management',         'Manage confirmed orders',                                      5,  1),
    (42, 'MD006',  NULL, 'Manufacturing Orders - NEW',         'Handle new manufacturing orders',                              6,  1),
    (43, 'MD006',  NULL, 'Order Route Details',                'Manage order route details',                                   7,  1),
    (44, 'MD006',  NULL, 'Order Component Details',            'Manage order component details',                               8,  1),
    (45, 'MD006',  NULL, 'Product Item SMV Detail',            'Manage product item SMV details',                              9,  1),
    (46, 'MD006',  NULL, 'Order PO Shipment Detail',           'Manage PO shipment details for orders',                        10, 1),
    (47, 'MD006',  NULL, 'Order Misc. Approvals',              'Handle miscellaneous order approvals',                         11, 1),
    (48, 'MD006',  NULL, 'Order Production Status',            'Track production status of orders',                            13, 1),
    (49, 'MD006',  NULL, 'MO Production Assign',               'Assign MO production tasks',                                   12, 1),
    (50, 'MD007',  NULL, 'Event Frame Works',                  'Define and manage planning event frameworks',                  1,  1),
    (51, 'MD007',  NULL, 'Event Management',                   'Manage planning events',                                       2,  1),
    (52, 'MD007',  NULL, 'Operations Scheduling',              'Schedule operations for planning',                             3,  1),
    (53, 'MD007',  NULL, 'Order Scheduling',                   'Manage scheduling of orders',                                  4,  1),
    (54, 'MD007',  NULL, 'Forecast Schedule',                  'Manage forecast schedules',                                    5,  1),
    (55, 'MD007',  NULL, 'Sewing Planning Board',              'Plan sewing schedules and resources',                          6,  1),
    (56, 'MD007',  NULL, 'Shipment Scheduling',                'Manage scheduling of shipments',                               7,  1),
    (57, 'MD008',  NULL, 'BOM Template',                       'Manage Bill of Material templates',                            1,  1),
    (58, 'MD008',  NULL, 'BOM Structure',                      'Define and manage BOM structures',                             2,  1),
    (59, 'MD008',  NULL, 'BOM Estimation',                     'Estimate BOM requirements',                                    3,  1),
    (60, 'MD008',  NULL, 'BOM Purchase Mapping',               'Map purchase items in BOM',                                    4,  1),
    (61, 'MD008',  NULL, 'Firm Material Purchase Order',       'Manage firm material purchase orders',                         5,  1),
    (62, 'MD008',  NULL, 'Group Purchase Mapping',             'Manage group purchase mappings',                               6,  1),
    (63, 'MD008',  NULL, 'Material Purchase Order',            'Manage material purchase orders',                              7,  1),
    (64, 'MD008',  NULL, 'RM Quotation Tracking',              'Track raw material quotations',                                8,  1),
    (65, 'MD008',  NULL, 'RM Quotation Management',            'Manage raw material quotations',                               9,  1),
    (66, 'MD008',  NULL, 'Material Lead Time Management',      'Manage lead time for materials',                               10, 1),
    (67, 'MD008',  NULL, 'MPO Approval List',                  'List of MPO approvals',                                        11, 1),
    (68, 'MD008',  NULL, 'FOC MPO Confirmation List',          'Confirmation list of FOC MPO',                                 12, 1),
    (69, 'MD008',  NULL, 'Material Requirement Plan',          'Plan for material requirements',                               13, 1),
    (70, 'MD008',  NULL, 'MRP-MO Prod Assign',                 'Assign production based on MRP-MO',                            14, 1),
    (71, 'MD008',  NULL, 'BOM Consumption Detail',             'Track BOM consumption details',                                15, 1),
    (72, 'MD009',  NULL, 'Material Receipt Detail',            'Track details of material receipts',                           1,  1),
    (73, 'MD009',  NULL, 'Goods Received Note',                'Record goods received notes',                                  2,  1),
    (74, 'MD009',  NULL, 'Material Replacement Received',      'Track received material replacements',                         3,  1),
    (75, 'MD009',  NULL, 'Lot Batch Detail',                   'Manage lot batch details',                                     4,  1),
    (76, 'MD009',  NULL, 'Lot Batch Allocation',               'Allocate lot batches',                                         5,  1),
    (77, 'MD009',  NULL, 'Material Transfer To Cut',           'Transfer material to cutting',                                 6,  1),
    (78, 'MD009',  NULL, 'Material Issue',                     'Issue materials to production or other uses',                  7,  1),
    (79, 'MD009',  NULL, 'Material Issue - MRN',               'Manage MRN-based material issues',                             8,  1),
    (80, 'MD009',  NULL, 'Material Return To Stock',           'Return unused material to stock',                              9,  1),
    (81, 'MD009',  NULL, 'Material Return To Vendor',          'Return materials back to vendor',                              10, 1),
    (82, 'MD009',  NULL, 'Material Location Transfer',         'Transfer material between locations',                          11, 1),
    (83, 'MD009',  NULL, 'Material Movements',                 'Track material movement history',                              12, 1),
    (84, 'MD009',  NULL, 'Material Obsolete',                  'Mark obsolete materials',                                      13, 1),
    (85, 'MD009',  NULL, 'Material Re-allocation',             'Re-allocate materials for different usage',                    14, 1),
    (86, 'MD009',  NULL, 'Material Stock Adjustment',          'Adjust stock levels for materials',                            15, 1),
    (87, 'MD009',  NULL, 'Material Excess Return To Vendor',   'Return excess material to vendor',                             16, 1),
    (88, 'MD009',  NULL, 'Approved Material Returns',          'Manage approved material returns',                             17, 1),
    (89, 'MD009',  NULL, 'Material Stock Discontinued',        'Manage discontinued material stock',                           18, 1),
    (90, 'MD009',  NULL, 'Excess RM Acknowledgement',          'Acknowledge excess raw material',                              19, 1),
    (91,  'MD010', NULL, 'Cut Lay Plan RM Requisition',        'Manage cut lay plan raw material requisition',                 1,  1),
    (92,  'MD010', NULL, 'Material Requisition Note',          'Track material requisition notes',                             2,  1),
    (93,  'MD010', NULL, 'Excess RM Return Note',              'Manage return notes for excess raw materials',                 3,  1),
    (94,  'MD010', NULL, 'Cut Order Mngt - Component G',       'Manage cut orders and component groups',                       4,  1),
    (95,  'MD010', NULL, 'Marker Plan',                        'Manage marker planning',                                       5,  1),
    (96,  'MD010', NULL, 'Cut Lay Detail',                     'Handle cut lay details',                                       6,  1),
    (97,  'MD010', NULL, 'Cut Sheet',                          'Manage cut sheets',                                            7,  1),
    (98,  'MD010', NULL, 'Material Remnant Issues',            'Handle issues of material remnants',                           8,  1),
    (99,  'MD010', NULL, 'Cutting Sub Process IN',             'Track cutting subprocess IN',                                  9,  1),
    (100, 'MD010', NULL, 'Cutting Sub Process Production',     'Track cutting subprocess production',                          10, 1),
    (101, 'MD010', NULL, 'Cutting Supermarket In',             'Manage cutting supermarket IN process',                        11, 1),
    (102, 'MD010', NULL, 'Sewing Bundle',                      'Manage sewing bundles',                                        12, 1),
    (103, 'MD010', NULL, 'Cutting Supermarket Out',            'Manage cutting supermarket OUT process',                       13, 1),
    (104, 'MD010', NULL, 'Sewing In',                          'Track sewing IN process',                                      14, 1),
    (105, 'MD010', NULL, 'Sewing WIP Bundle Management',       'Manage sewing WIP bundles',                                    15, 1),
    (106, 'MD010', NULL, 'Sewing Transaction',                 'Track sewing transactions',                                    16, 1),
    (107, 'MD010', NULL, 'Sewing Out With Batch Tag',          'Track sewing out with batch tag',                              17, 1),
    (108, 'MD010', NULL, 'Customer Invoice',                   'Manage customer invoices in production',                       18, 1),
    (109, 'MD010', NULL, 'FG Order Transfer',                  'Transfer finished goods orders',                               19, 1),
    (110, 'MD010', NULL, 'FG Mics Issue',                      'Manage miscellaneous finished goods issues',                   20, 1),
    (111, 'MD011', NULL, 'Fabric Roll QC Management',          'Manage QC for fabric rolls',                                   1,  1),
    (112, 'MD011', NULL, 'Lot Batch Inspection',               'Inspect lot batches for quality',                              2,  1),
    (113, 'MD011', NULL, 'Material Inspection',                'Inspect materials for defects and quality',                    3,  1),
    (114, 'MD011', NULL, 'RM Lab Testing',                     'Conduct raw material lab testing',                             4,  1),
    (115, 'MD011', NULL, 'RM Lot Batch Grouping',              'Group raw material lot batches',                               5,  1),
    (116, 'MD011', NULL, 'Cut Component Inspection',           'Inspect cut components for defects',                           6,  1),
    (117, 'MD011', NULL, 'Sewing End-Line Inspection',         'Inspect sewing quality at end-line',                           7,  1),
    (118, 'MD011', NULL, 'Sewing QA Inspection',               'Conduct sewing QA inspection',                                 8,  1),
    (119, 'MD011', NULL, 'Sewing AQL Inspection',              'Perform sewing AQL inspection',                                9,  1),
    (120, 'MD011', NULL, 'Fabric Inspection',                  'Inspect fabrics for quality assurance',                        10, 1),
    (121, 'MD011', NULL, 'Lot Batch Damage Management',        'Manage lot batch damages',                                     11, 1),
    (122, 'MD011', NULL, 'Quality Assurance Inspection',       'Perform QA inspections',                                       12, 1),
    (123, 'MD011', NULL, 'PO QA Inspection Management',        'Manage QA inspections for purchase orders',                    13, 1),
    (124, 'MD012', NULL, 'Shipment Plan',                      'Plan shipments and schedules',                                 1,  1),
    (125, 'MD012', NULL, 'Pre-Shipment Packing Slip',          'Manage pre-shipment packing slips',                            2,  1),
    (126, 'MD012', NULL, 'FG Packing Acceptation',             'Manage finished goods packing acceptation',                    3,  1),
    (127, 'MD012', NULL, 'Packing Completion',                 'Track and manage packing completion',                          4,  1),
    (128, 'MD012', NULL, 'Packing Slip Management',            'Manage packing slips for shipments',                           5,  1),
    (129, 'MD012', NULL, 'FG WH Acceptation',                  'Warehouse acceptation of finished goods',                      6,  1),
    (130, 'MD012', NULL, 'Order PO FG Reallocation',           'Reallocate finished goods POs',                                7,  1),
    (131, 'MD012', NULL, 'FG Location Transfer',               'Transfer finished goods locations',                            8,  1),
    (132, 'MD012', NULL, 'FG Movements',                       'Track movements of finished goods',                            9,  1),
    (133, 'MD012', NULL, 'Shipment Management',                'Manage shipment operations',                                   10, 1),
    (134, 'MD012', NULL, 'Invoicing',                          'Manage invoicing for sales and distribution',                  11, 1),
    (135, 'MD013', NULL, 'Order Book',                         'View and analyze order book reports',                          1,  1),
    (136, 'MD013', NULL, 'Order Analytics',                    'Analytics reports for orders',                                 2,  1),
    (137, 'MD013', NULL, 'Product Attributes Analysis',        'Analyze product attributes reports',                           3,  1),
    (138, 'MD013', NULL, 'Overall Order Performance Analysis', 'Overall performance analysis for orders',                      4,  1),
    (139, 'MD013', NULL, 'Vendor Scorecard',                   'Vendor scorecard performance reports',                         5,  1),
    (140, 'MD013', NULL, 'BOM Status Analysis',                'Analyze Bill of Material status reports',                      6,  1),
    (141, 'MD013', NULL, 'FG Item Style List',                 'Finished goods item style listing',                            7,  1),
    (142, 'MD013', NULL, 'Material Item Analysis',             'Analyze material items reports',                               8,  1),
    (143, 'MD013', NULL, 'MO Scheduling Status',               'Reports on MO scheduling status',                              9,  1),
    (144, 'MD013', NULL, 'Sewing Performance Dashboard',       'Dashboard for sewing performance',                             10, 1),
    (145, 'MD014', NULL, 'MY Favorites Menu',                  'Manage user favorite menus',                                   1,  1),
    (146, 'MD014', NULL, 'User List',                          'Manage system users list',                                     2,  1),
    (147, 'MD014', NULL, 'Email Groups',                       'Manage email groups for notifications',                        3,  1),
    (148, 'MD014', NULL, 'Reset Password',                     'Reset user passwords',                                         4,  1),
    (149, 'MD014', NULL, 'Notification Email Config',          'Configure notification email settings',                        5,  1),
    (183, 'MD016', NULL, 'Work Area',                          NULL,                                                           1,  1),
    (184, 'MD016', NULL, 'Report',                             NULL,                                                           2,  1),
    (185, 'MD016', NULL, 'Setting',                            NULL,                                                           3,  1);
GO

SET IDENTITY_INSERT [dbo].[categories] OFF;
GO


SET IDENTITY_INSERT dbo.contents ON;
INSERT INTO contents (
    id, category_id, parent_id, title,
    html_content, plain_content,
    is_published, view_count, order_index
)
VALUES
    (6, 41, NULL, 'Overvieww', '<p><br></p>', '', 1, 0, 0),
    (37, 38, NULL, 'Block Order Entry',
        'Overview of block order entry function',
        'Overview of block order entry function', 1, 0, 1),
    (38, 38, NULL, 'How to view block order',
        'View and filter block orders',
        'View and filter block orders', 1, 0, 2),
    (39, 38, NULL, 'How to view edit version',
        'View revision history of block orders',
        'View revision history of block orders', 1, 0, 3),
    (40, 41, NULL, 'Create header sale order',
        NULL, NULL, 1, 0, 1),
    (41, 41, NULL, 'Create PO wise style detail',
        NULL, NULL, 1, 0, 2),
    (42, 41, NULL, 'Validation process',
        NULL, NULL, 1, 0, 3),
    (43, 184, NULL, 'GRN Listng',
        NULL, NULL, 1, 0, 1),
    (44, 184, NULL, 'GIN ',
        NULL, NULL, 1, 0, 2),
    (68, 38, NULL, 'Block Order Entry',
        'Overview of block order entry function',
        'Overview of block order entry function', 1, 0, 1),
    (69, 38, NULL, 'How to view block order',
        'View and filter block orders',
        'View and filter block orders', 1, 0, 2),
    (70, 38, NULL, 'How to view edit version',
        'View revision history of block orders',
        'View revision history of block orders', 1, 0, 3),
    (74, 184, NULL, 'GRN Listng',
        NULL, NULL, 1, 0, 1),
    (75, 184, NULL, 'GIN ',
        NULL, NULL, 1, 0, 2),
    (103, 41, NULL, 'New content',
        '<p>New Content</p>', 'New Content', 1, 0, 4),
    (104, 41, NULL, 'Another content',
        '<p>Another Content</p>', 'Another Content', 1, 0, 5);


INSERT INTO contents (
    id, category_id, parent_id, title,
    html_content, plain_content,
    is_published, view_count, order_index
)
VALUES
    -- id = 7 (bản dài HTML của bạn, giữ nguyên như hiện tại, không có cột time)
    (7, 41, 40, 'Create header sale order',
        '<p><strong style="font-family: Arial; font-size: 14px;">Below is instruction how to createSale order in FXPRO</strong></p><p><span style="color: red; font-family: Arial; font-size: 14px;">Link: FXS --&gt; Order Management --&gt;Work Area--&gt; ConfirmedOrder Management</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 1: </strong><span style="font-family: Arial; font-size: 14px;">To create new Sale order, Clicksymbol “+” or Ctrl + N</span></p><p><span style="font-family: Arial; font-size: 14px;">+ Company ID: It will show defaultvalue from systemautomatically</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 2: </strong><span style="font-family: Arial; font-size: 14px;">Order Type: There are some available value (Bulk Order, Stock Lot, Sample, Virtual). User must be select kind of order type for being Sale Order</span></p><p><span style="font-family: Arial; font-size: 14px;">+ Order ID: System will generate automatically</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 3</strong><span style="font-family: Arial; font-size: 14px;">: ProductClass: Select correctproduct class for order from available list (singleor multiple FG)</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 4: </strong><span style="font-family: Arial; font-size: 14px;">Order program:The User has to selectif available</span></p><p><span style="font-family: Arial; font-size: 14px;">+ customer detail for step 5,6,7 will automatically displays</span></p><p><span style="font-family: Arial; font-size: 14px;">If no Order program: continueselect step 5,6,7 for </span><strong style="font-family: Arial; font-size: 14px;">customer detail</strong><span style="font-family: Arial; font-size: 14px;">:</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><span style="font-family: Arial; font-size: 14px; color: red;">Step 5/6/7: customerdetail select base on available</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 8: </strong><span style="font-family: Arial; font-size: 14px;">segment detail if have</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 9</strong><span style="font-family: Arial; font-size: 14px;">: Order PO style: user enter style of PO</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 10</strong><span style="font-family: Arial; font-size: 14px;">: Order PO No.: user enter PO number</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 11: </strong><span style="font-family: Arial; font-size: 14px;">Order confirmeddate: user select date</span></p><p><span style="font-family: Arial; font-size: 14px;">+ Contract confirmed date: Default = Order confirmed date but allow to keep blank if wants.</span></p><p><span style="font-family: Arial; font-size: 14px;">+ Contract expiredDate/Contract Ref. No: can keep blank</span></p><p><span style="font-family: Arial; font-size: 14px;">+ Contract Ref No: User can inputContract No. Or cankeep blank</span></p><p><span style="font-family: Arial; font-size: 14px;">+ Trading company:Default login companybut allow to change if have</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 12: </strong><span style="font-family: Arial; font-size: 14px;">Currency: DefaultUSD but allow to change</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 13: </strong><span style="font-family: Arial; font-size: 14px;">price type: Default FOB but allowto change</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 14: </strong><span style="font-family: Arial; font-size: 14px;">Merchandiser: user select from the list</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 15: </strong><span style="font-family: Arial; font-size: 14px;">Product developer: user select from the list</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 16: </strong><span style="font-family: Arial; font-size: 14px;">Note: if have</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 17: </strong><span style="font-family: Arial; font-size: 14px;">Factory season:must select</span></p><p><span style="font-family: Arial; font-size: 14px;">+ </span><strong style="font-family: Arial; font-size: 14px; color: red;">Step 18: </strong><span style="font-family: Arial; font-size: 14px;">click savingbutton to save the sale order header</span></p>', 
        'Below is instruction how to createSale order in FXPROLink: FXS --&gt; Order Management --&gt;Work Area--&gt; ConfirmedOrder Management+ Step 1: To create new Sale order, Clicksymbol “+” or Ctrl + N+ Company ID: It will show defaultvalue from systemautomatically+ Step 2: Order Type: There are some available value (Bulk Order, Stock Lot, Sample, Virtual). User must be select kind of order type for being Sale Order+ Order ID: System will generate automatically+ Step 3: ProductClass: Select correctproduct class for order from available list (singleor multiple FG)+ Step 4: Order program:The User has to selectif available+ customer detail for step 5,6,7 will automatically displaysIf no Order program: continueselect step 5,6,7 for customer detail:+ Step 5/6/7: customerdetail select base on available+ Step 8: segment detail if have+ Step 9: Order PO style: user enter style of PO+ Step 10: Order PO No.: user enter PO number+ Step 11: Order confirmeddate: user select date+ Contract confirmed date: Default = Order confirmed date but allow to keep blank if wants.+ Contract expiredDate/Contract Ref. No: can keep blank+ Contract Ref No: User can inputContract No. Or cankeep blank+ Trading company:Default login companybut allow to change if have+ Step 12: Currency: DefaultUSD but allow to change+ Step 13: price type: Default FOB but allowto change+ Step 14: Merchandiser: user select from the list+ Step 15: Product developer: user select from the list+ Step 16: Note: if have+ Step 17: Factory season:must select+ Step 18: click savingbutton to save the sale order header',
        1, 0, 0),

    (45, 41, 40, 'Product detail',
        NULL, NULL, 1, 0, 1),
    (46, 41, 40, 'Size chart template',
        NULL, NULL, 1, 0, 2),
    (47, 41, 40, 'Change Status for Sale Order',
        NULL, NULL, 1, 0, 3),

    (48, 41, 41, 'New BPO line creation',
        NULL, NULL, 1, 0, 1),
    (49, 41, 41, 'Copy PO',
        NULL, NULL, 1, 0, 2),
    (50, 41, 41, 'Enter size breakdown',
        NULL, NULL, 1, 0, 3),
    (51, 41, 41, 'Copy size breakdown',
        NULL, NULL, 1, 0, 4),
    (52, 41, 41, 'BPO status',
        NULL, NULL, 1, 0, 5),
    (53, 41, 41, 'Order DTW (delivery time window)',
        NULL, NULL, 1, 0, 6),
    (54, 41, 41, 'Material lead time',
        NULL, NULL, 1, 0, 7),
    (55, 41, 41, 'Production lead time (Target PCD)',
        NULL, NULL, 1, 0, 8),

    (30, 41, 42, 'Product detail',
        '<p><span style="background-color: rgb(243, 251, 255); color: oklch(0.278 0.033 256.848); font-size: 14px; font-family: Arial;">Must adding before entry BPO detail.</span></p>',
        'Must adding before entry BPO detail.Not allow to remove if already available BPO info.',
        1, 0, 0),
    (31, 41, 42, 'Size chart template',
        '<p><span style="background-color: rgb(251, 253, 255); color: oklch(0.278 0.033 256.848); font-size: 14px; font-family: Arial;">Must adding before entry BPO detail</span></p>',
        'Must adding before entry BPO detailNot allow to remove if already available BPO info.',
        1, 0, 1),
    (32, 41, 42, 'Order status detail',
        '<p><span style="background-color: rgb(251, 253, 255); color: oklch(0.278 0.033 256.848); font-size: 14px; font-family: Arial;">Capture history sale order with status OPEN, CLOSE, ON HOLD, CANCEL,DELETED and USER ID</span></p><p><br></p>',
        'Capture history sale order with status OPEN, CLOSE, ON HOLD, CANCEL,DELETED and USER ID',
        1, 0, 2),
    (33, 41, 42, 'OPEN',
        '<p><span style="background-color: rgb(251, 253, 255); color: oklch(0.278 0.033 256.848); font-size: 14px; font-family: Arial;">Allow to delete ifno BPO size breakdown detailor all BPO status deleted</span></p><p><span style="background-color: rgb(251, 253, 255); color: oklch(0.278 0.033 256.848); font-size: 14px; font-family: Arial;">Allow to on hold</span></p><p><span style="background-color: rgb(251, 253, 255); color: oklch(0.278 0.033 256.848); font-size: 14px; font-family: Arial;">Allow to canceled if all BPO status canceled</span></p><p><span style="background-color: rgb(251, 253, 255); color: oklch(0.278 0.033 256.848); font-size: 14px; font-family: Arial;">Allow to addingnew BPO detail</span></p><p><br></p>',
        'Allow to delete ifno BPO size breakdown detailor all BPO status deletedAllow to on holdAllow to canceled if all BPO status canceledAllow to addingnew BPO detail',
        1, 0, 3),
    (34, 41, 42, 'ON HOLD',
        '<p><span style="background-color: rgb(251, 253, 255); color: oklch(0.278 0.033 256.848); font-size: 14px; font-family: Arial;">Allow to open again SO</span></p>',
        'Allow to open again SONot allow to deleted/cancelSO on hold: Not allow to adding new BPO line detail/Not allow to delete BPO/ ...',
        1, 0, 4),
    (35, 41, 42, 'CLOSED',
        '<p><span style="background-color: rgb(251, 253, 255); color: oklch(0.278 0.033 256.848); font-size: 14px; font-family: Arial;">Not allow to do any modification</span></p>',
        'Not allow to do any modification', 1, 0, 5),
    (36, 41, 42, 'CANCEL/DELETED',
        '<p>Define as de-active Not allow to do any modification</p>',
        'Define as de-active Not allow to do any modification', 1, 0, 6),

    (100, 41, 40, 'Test con 6',
        '<p>con 6</p>', 'con 6', 1, 0, 4),
    (101, 41, 40, 'Test 7',
        'test 7', 'test 7', 1, 0, 5);

		INSERT INTO contents (
    id, category_id, parent_id, title,
    html_content, plain_content,
    is_published, view_count, order_index
)
VALUES
    (9, 41, 45, 'Save Image',
        '<ol><li ...>After save the sale order...</li>...</ol>',
        'After save the sale order, the user have to allocate product detailfor that ordercurrently the systemcompulsory update image/sketch of that sale orderthe user selectbase on step 1,2 as snapshotd',
        1, 0, 1),

    (10, 41, 45, 'Allocate FG item for Sale order',
        '<p><strong>At the FG item detailtap</strong> ...</p>',
        'At the FG item detailtap: the user selectsFG item for that sale order / enter the ratio if have. (Default ratio =1) ~> click save Following step 3,4,5 as snapshotNote: base on the productitem class selectioncan be single or multipleFG item in one sale order.',
        1, 0, 2),

    (11, 41, 45, 'Allocate FG item color for sale order',
        '<p><strong ...>At the FG item color detail tab: </strong>...</p>',
        'At the FG item color detail tab: the user selectsFG color and adding unit price, CM costUnit price: FOB of that color costCM cost: Default= Unit price but user can editPlease note thatthe system validate the Unit price is always equal or greater than CM cost. Following step 1,2,3,4 as snapshotRemove button: Allow to remove the color incase add wrong still not available any BPO lineInactive button: Allow to inactivecolor incase not apply for that colorand available BPO.',
        1, 0, 3),

    (12, 41, 46, 'Size chart template',
        '<p>To enter size breakdown, detail the user should select correct the size chart template of that order.</p>',
        'To enter size breakdown, detail the user should select correct the size chart template of that order.',
        1, 0, 0),

    (13, 41, 47, 'Change Status for Sale Order',
        '<p>There are 5 kind of status: ...</p>',
        'There are 5 kind of status:+Delete: ...', 1, 0, 0),

    (15, 41, 48, 'New BPO line creation',
        '<p>The user following step as below:</p>...',
        'The user following step as below:+ Order PO ID: ... ~> Click save',
        1, 0, 0),

    (16, 41, 49, 'Copy POE',
        '<p>If the same info user can use copy PO ...</p>',
        'If the same info user can use copy PO to createnew PO, edit information and save to saving time',
        1, 0, 0),

    (17, 41, 50, 'Enter size breakdown by qty',
        '<p>The user selects the BPO line and add qty basedon Customer PO ~> SAVE </p>...',
        'The user selects the BPO line and add qty basedon Customer PO ~> SAVE Validation: MO qty should equal or greater than Order qty',
        1, 0, 1),

    (18, 41, 50, 'Enter size breakdown by ratio %',
        '<p>The user Enter total qty first...</p>',
        'The user Enter total qty first, after that enter size wise %ratio, the system auto calculate qty.validate %: Saving time, system check the total of Ratio % > 105%, Just adding warning msg only',
        1, 0, 2),

    (19, 41, 51, 'Copy size breakdown',
        '<p>If any BPO line is the same qty ...</p>',
        'If any BPO line is the same qty the user can copy BPO same orderto saving time.',
        1, 0, 0),

    (20, 41, 52, 'BPO status OPEN',
        '<ol><li>...</li></ol>',
        'The System not allow cancelbut The User can delete.User can reviseanytime with all fields exceptColor and Deliveryterm.',
        1, 0, 0),
    (21, 41, 52, 'BPO status CONFIRMED',
        '<p>User should follow as below direction to revise and checking status.</p>',
        'User should follow as below direction to revise and checking status.', 1, 0, 1),
    (22, 41, 52, 'PO Unit Price Alteration',
        '<p><strong><u>PO Unit Price Alteration</u></strong>: to change price</p>...',
        'PO Unit Price Alteration: to change priceThe user selects BPO need to change and update the price ~> save and view history',
        1, 0, 2),
    (23, 41, 52, 'PO Detail Alteration',
        '<p><strong><u>PO Detail Alteration: </u></strong>...</p>',
        'PO Detail Alteration: to change delivery date, production month, delivery location',
        1, 0, 3),
    (24, 41, 52, 'PO Size amendment',
        '<h3><strong><u>PO Size amendment</u></strong>...</h3>...',
        'PO Size amendment: To view size detail after changedTo change size detail ...',
        1, 0, 4),
    (25, 41, 52, 'PO Status change detail',
        '<p><strong><u>PO Status change detail: </u></strong>...</p>',
        'PO Status change detail: To view all the status of BPO wiseTo change size detail ...',
        1, 0, 5),
    (26, 41, 52, 'BPO status Canceled',
        '<p>The system allow to cancel BPO line detail if not release to production.</p>',
        'The system allow to cancel BPO line detail if not release to production.',
        1, 0, 6),

    (27, 41, 53, 'Order DTW (delivery time window)',
        '<p>The system facilities for user can view the Start/completed delivery ...</p>',
        'The system facilities for user can view the Start/completed deliveryand all the production months allocated for that order.+ IF change production month ...',
        1, 0, 0),

    (28, 41, 54, 'Material lead time',
        '<p><strong><u>Validated</u></strong>: must enter RMlead time ...</p>',
        'Validated: must enter RMlead time before approve BPOThe system facilities to create the longest material lead time to monitoring material lead time of order (TNA) Estimate material in house = Material lead time + order confirmed date',
        1, 0, 0),

    (29, 41, 55, 'Production lead time (Target PCD)',
        '<p>Based on longest the material lead time, ...</p>',
        'Based on longest the material lead time, the system auto proposedthe possible PCD for refer,and the user can enter target P CD to make TNA/plan of all even for that order.',
        1, 0, 0),

    (102, 41, 45, 'asdasdasd',
        '<p>asdasdasd</p>', 'asdasdasd', 1, 0, 4);
SET IDENTITY_INSERT contents OFF;



INSERT INTO dbo.[users] (
    username,
    email,
    password_hash,
    role,
    is_active,
    token_version
)
VALUES
    ('admin', 'admin@example.com',
     '$2b$11$12mj4VW8dui3lrvwtMNm9ukunoh8z.lpd63kzMw4HSSyTJi1Cs/fC',
     'admin', 1, 0),

    ('cus1', 'cus1@example.com',
     '$2b$11$IT.Z/7BJMtG/SH2IpiXqF.NoWx7qHy2oofoLYvYqbYEI/tlY4jmSm',
     'customer', 1, 0),

    ('admin1', 'admin1@example.com',
     '$2b$11$tM8XtoDYoSIVZMoxJvMLIeSRpTpe44vw0bJVntsi3E0Ssad47BDcm',
     'admin', 1, 0),

    ('user1', 'user1@example.com',
     '$2b$11$qWlfPiUvpKLeZaRJ/d/8wuQORTlZ9GtIbDiUrH43IHdufhwk0Ujm2',
     'customer', 1, 0),

    ('luongxmen', 'luongxmen1402@gmail.com',
     '$2b$11$dWsUVAarKAJb.f3JPs805eNMbudmd0Xu.Md0fxhEMucsleOJUkm1i',
     'customer', 1, 0);

SET IDENTITY_INSERT dbo.[content_images] ON;

INSERT INTO dbo.[content_images] (
    id,
    content_id,
    image_url,
    caption,
    order_index
)
VALUES
    (6, 6, '/uploads/1763345856165_eaf57528483a.png', 'overview', 0),
    (7, 7, '/uploads/1763346776822_74ec15664798.png', 'step17', 0),
    (8, 7, '/uploads/1763346780346_ac7161c4aa44.png', 'step18', 0),
    (9, 10, '/uploads/1763347661299_5cd084eb6e76.png', 'Allocate FG item for Sale order', 0),
    (10, 11, '/uploads/1763347753315_92154fdd234c.png', 'Allocate FG item color for sale order', 0),
    (11, 12, '/uploads/1763347930285_c9cabc33a6c6.png', 'Size chart template', 0),
    (12, 13, '/uploads/1763348042597_9516ae383be5.png', 'Change Status for Sale Order', 0),
    (13, 15, '/uploads/1763348309957_00ea2a139d2e.png', 'New BPO line creation', 0),
    (14, 16, '/uploads/1763348591651_64e74bcd649c.png', 'Copy PO', 0),
    (15, 17, '/uploads/1763348672376_1a71e9d48737.png', 'Enter size breakdown by qty', 0),
    (16, 18, '/uploads/1763348850347_aba99099ff18.jpg', 'Enter size breakdown by ratio %', 0),
    (17, 19, '/uploads/1763349262597_32346209ac24.png', 'Copy size breakdown', 0),
    (18, 20, '/uploads/1763350201458_f482a1eaed63.png', 'BPO status OPEN', 0),
    (19, 21, '/uploads/1763350756420_5441cc24304e.png', 'BPO status CONFIRMED', 0),
    (20, 22, '/uploads/1763350876674_010cffc9bd1a.png', 'PO to change price', 0),
    (21, 23, '/uploads/1763351010969_383433738312.png', 'PO Detail Alteration', 0),
    (22, 24, '/uploads/1763351126011_c6a33ccfa7fb.png', 'PO Size amendment', 0),
    (23, 25, '/uploads/1763351218447_3252e8c61ec2.png', 'PO Status change detail', 0),
    (24, 26, '/uploads/1763351275549_f905ba629b2a.png', 'BPO status Canceled', 0),
    (25, 27, '/uploads/1763351364568_b05ef9691628.png', 'Order DTW (delivery time window)', 0),
    (26, 28, '/uploads/1763351427669_87433c594e1c.png', 'Material lead time', 0),
    (27, 29, '/uploads/1763351486111_b698be5cd548.png', 'Production lead time (Target PCD)', 0),
    (28, 7, '/uploads/1764734377706_cce6974818e1.jfif', '4b1f3ff0 2322 4426 b22c 37d6883b55fd', 0),
    (29, 7, '/uploads/1764734380385_3de25ab9ec88.jpg', '1019885894470970912', 0);

SET IDENTITY_INSERT dbo.[content_images] OFF;
