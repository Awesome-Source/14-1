class PlayerState
{
    public Name: string;
    public Label: string;
    public CurrentScore: number;
    public PreviousScore: number;
    public HighestSeries: number;
    public Take: number;
    public FoulCount: number;

    constructor(name: string, label: string)
    {
        this.Name = name;
        this.Label = label;
        this.CurrentScore = 0;
        this.PreviousScore = 0;
        this.HighestSeries = 0;
        this.Take = 0;
        this.FoulCount = 0;
    }
}