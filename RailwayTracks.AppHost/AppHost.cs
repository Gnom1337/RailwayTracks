var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.RailwayTracks>("railwaytracks");

builder.Build().Run();
