// Program.cs — ScrollBridge host wiring
//
// Environment:
//   SCROLL_QUEUE__PAYMENTS   payment-event queue endpoint   (default: in-proc)
//   SCROLL_QUEUE__PUSH       push-outbox queue endpoint     (default: in-proc)
//   SCROLL_PUSH__MAX_DAILY   per-user daily push cap        (default: 8)
//   SCROLL_DB__CONNECTION    Postgres connection string     (required at scale)

using System.Collections.Concurrent;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ScrollBridge;

var builder = Host.CreateApplicationBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ── rate caps (mirrors the app's notification guardrails) ──
var maxDailyPush = int.TryParse(Environment.GetEnvironmentVariable("SCROLL_PUSH__MAX_DAILY"), out var m) ? m : 8;

builder.Services.AddSingleton<IEntitlementStore, InMemoryEntitlementStore>(); // swap for Postgres at scale
builder.Services.AddSingleton(new UserRateLimiter(maxDailyPush));
builder.Services.AddSingleton<PushDispatcher>();
builder.Services.AddSingleton<PaymentEventProcessor>();

// ── v11: telemetry schema mirror + tap emission into the app's engine ──
// SCROLL_TAP__URL (e.g. "https://app.example.com") enables it; unset = no-op.
// Constructor validates the schema fingerprint against the pin (fail-fast).
// (userId on TapAsync is reserved for the server-to-server auth header when
// the ingest grows a service-key lane; today the web ingest derives the user
// from the session.)
builder.Services.AddSingleton(sp =>
    new EngineTapClient(builder.Configuration, sp.GetRequiredService<ILogger<EngineTapClient>>()));

// ── in-proc queues (swap for RabbitMQ/SQS transports at 600k users) ──
builder.Services.AddSingleton(_ => new BlockingCollection<PaymentEvent>(boundedCapacity: 10_000));
builder.Services.AddSingleton(_ => new BlockingCollection<(PushMessage msg, DateTime localTime)>(boundedCapacity: 50_000));

builder.Services.AddHostedService<PaymentEventWorker>();
builder.Services.AddHostedService<PushDispatchWorker>();

var host = builder.Build();
host.Run();
