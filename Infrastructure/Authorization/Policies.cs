namespace RailwayTracks.Authorization
{
    public static class Policies
    {
        public const string AdminOnly = "AdminOnly";

        public const string DefectRead = "DefectRead";
        public const string DefectCreate = "DefectCreate";
        public const string DefectUpdate = "DefectUpdate";
        public const string DefectDelete = "DefectDelete";
        public const string DefectStatusChange = "DefectStatusChange";
        public const string DefectRepair = "DefectRepair";

        public const string DefectTypeManage = "DefectTypeManage";
        public const string LocationManage = "LocationManage";
        public const string RepairTeamManage = "RepairTeamManage";
        public const string InspectorManage = "InspectorManage";
        public const string DataSourceManage = "DataSourceManage";
        public const string TrackSchemeRead = "TrackSchemeRead";
        public const string TrackSchemeManage = "TrackSchemeManage";
    }
}
