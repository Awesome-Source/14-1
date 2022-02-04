class HtmlUtils{
    public static SwitchClass(element: Element, classToRemove: string, classToAdd: string)
    {
        element.classList.remove(classToRemove);
    
        if(!element.classList.contains(classToAdd))
        {
            element.classList.add(classToAdd);
        }
    }
    
    public static ShowElementById(elementId: string)
    {
        const element =document.querySelector("#" + elementId);
        element.classList.remove("w3-hide");
    }
    
    public static HideElementById(elementId: string)
    {
        const element =document.querySelector("#" + elementId);
        if(!element.classList.contains("w3-hide"))
        {
            element.classList.add("w3-hide");
        }
    }
    
    public static SetInnerHtmlById(elementId: string, innerHtml: string)
    {
        const element = document.querySelector("#" + elementId);
        element.innerHTML = innerHtml;
    }
    
    public static GetInputFromElementWithId(elementId: string)
    {
        const element = <HTMLInputElement> document.querySelector("#" + elementId);
        return element.value;
    }
    
    public static StopPropagation(event: Event)
    {
        event = event || window.event;
        event.stopPropagation();
    }
}