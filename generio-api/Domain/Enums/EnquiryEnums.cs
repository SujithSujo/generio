namespace Generio.Api.Domain.Enums;

public enum EnquiryType
{
    BrandOwner = 0,
    Distributor = 1,
    General = 2,
    Other = 3
}

public enum EnquiryStatus
{
    New = 0,
    Contacted = 1,
    InProgress = 2,
    Qualified = 3,
    Closed = 4,
    Spam = 5
}
