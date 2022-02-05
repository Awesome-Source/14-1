class Validator
{
    public static IsNumeric(value: string) 
    {
        return /^\d+$/.test(value);
    }
}