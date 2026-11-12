using Checkout.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<CheckoutStore>();
var app = builder.Build();

app.MapGet("/health", () => Results.Ok());

app.MapPost("/api/discounts/validate", (DiscountRequest request, CheckoutStore store) =>
{
    var result = store.Validate(request);
    return result.Valid ? Results.Ok(result) : Results.BadRequest(result);
});

app.MapPost("/api/checkout", (CheckoutRequest request, CheckoutStore store) =>
{
    var result = store.Checkout(request);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
});

app.Run();
