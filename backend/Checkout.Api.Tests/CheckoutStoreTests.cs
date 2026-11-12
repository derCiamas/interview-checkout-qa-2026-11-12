using Checkout.Api;
using Xunit;

namespace Checkout.Api.Tests;

public class CheckoutStoreTests
{
    [Fact]
    public void ValidCodeCalculatesDiscountFromSubtotal()
    {
        var store = new CheckoutStore();
        var result = store.Validate(new DiscountRequest("SUMMER20", 200m));

        Assert.True(result.Valid);
        Assert.Equal(40m, result.Discount);
        Assert.Equal(160m, result.FinalPrice);
    }

    [Fact]
    public void UnknownCodeIsRejected()
    {
        var store = new CheckoutStore();
        var result = store.Validate(new DiscountRequest("UNKNOWN", 200m));

        Assert.False(result.Valid);
        Assert.Equal("Invalid discount code.", result.Message);
    }

    [Fact]
    public void CheckoutWithoutCodeReturnsOrderConfirmation()
    {
        var store = new CheckoutStore();
        var result = store.Checkout(new CheckoutRequest(200m, null));

        Assert.True(result.Success);
        Assert.NotNull(result.OrderId);
        Assert.Equal(200m, result.FinalPrice);
    }
}
