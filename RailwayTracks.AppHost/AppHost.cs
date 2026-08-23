var builder = DistributedApplication.CreateBuilder(args);

var api = builder
    .AddProject<Projects.RailwayTracks>("api");

var frontend = builder.AddViteApp(
    "frontend",
    "../railwaytracks.web");
builder.Build().Run();
