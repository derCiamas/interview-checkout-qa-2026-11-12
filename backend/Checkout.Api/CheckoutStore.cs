namespace Checkout.Api;

public record DiscountCode(string Code, decimal Percentage, decimal MinimumAmount,
    DateTimeOffset ExpiresAt, int MaximumUses);
public record DiscountRequest(string? Code, decimal Subtotal);
public record DiscountResult(bool Valid, string Message, decimal Discount, decimal FinalPrice);
public record CheckoutRequest(decimal Subtotal, string? Code);
public record CheckoutResult(bool Success, string Message, Guid? OrderId,
    decimal Subtotal, decimal Discount, decimal FinalPrice);
public record Order(Guid Id, decimal Subtotal, decimal Discount, decimal FinalPrice, string? Code);

public class CheckoutStore
{
    private readonly object gate = new();
    private readonly Dictionary<string, DiscountCode> codes;
    private readonly Dictionary<string, int> uses = new(StringComparer.OrdinalIgnoreCase);
    private readonly List<Order> orders = [];
    private readonly TimeProvider clock;

    public CheckoutStore() : this(
        [new DiscountCode("SUMMER20", 20m, 100m, new DateTimeOffset(2099, 12, 31, 23, 59, 59, TimeSpan.Zero), 100)],
        TimeProvider.System) { }

    public CheckoutStore(IEnumerable<DiscountCode> codes, TimeProvider clock)
    {
        this.codes = codes.ToDictionary(code => code.Code, StringComparer.OrdinalIgnoreCase);
        this.clock = clock;
    }

    public DiscountResult Validate(DiscountRequest request)
    {
        lock (gate) return ValidateCore(request);
    }

    public CheckoutResult Checkout(CheckoutRequest request)
    {
        lock (gate)
        {
            if (request.Subtotal <= 0)
                return new(false, "Subtotal must be greater than zero.", null, request.Subtotal, 0, 0);

            var discount = 0m;
            var code = request.Code?.Trim();
            if (!string.IsNullOrEmpty(code))
            {
                var validation = ValidateCore(new(code, request.Subtotal));
                if (!validation.Valid)
                    return new(false, validation.Message, null, request.Subtotal, 0, request.Subtotal);
                discount = validation.Discount;
                uses[code] = uses.GetValueOrDefault(code) + 1;
            }

            var order = new Order(Guid.NewGuid(), request.Subtotal, discount,
                Math.Max(0m, request.Subtotal - discount), code);
            orders.Add(order);
            return new(true, "Order submitted.", order.Id, order.Subtotal, order.Discount, order.FinalPrice);
        }
    }

    private DiscountResult ValidateCore(DiscountRequest request)
    {
        var code = request.Code?.Trim();
        if (request.Subtotal <= 0)
            return new(false, "Subtotal must be greater than zero.", 0, 0);
        if (string.IsNullOrEmpty(code) || !codes.TryGetValue(code, out var discount))
            return new(false, "Invalid discount code.", 0, request.Subtotal);
        if (discount.ExpiresAt <= clock.GetUtcNow())
            return new(false, "Discount code has expired.", 0, request.Subtotal);
        if (request.Subtotal < discount.MinimumAmount)
            return new(false, "Minimum order amount not met.", 0, request.Subtotal);
        if (uses.GetValueOrDefault(code) >= discount.MaximumUses)
            return new(false, "Discount code usage limit reached.", 0, request.Subtotal);

        var amount = Math.Clamp(decimal.Round(request.Subtotal * discount.Percentage / 100m, 2,
            MidpointRounding.AwayFromZero), 0m, request.Subtotal);
        return new(true, "Discount applied.", amount, request.Subtotal - amount);
    }
}
