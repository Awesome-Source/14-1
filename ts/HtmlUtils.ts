class HtmlUtils{
    public static SwitchClass(element: Element, classToRemove: string, classToAdd: string)
    {
        element.classList.remove(classToRemove);
        element.classList.add(classToAdd);
    }
    
    public static ShowElementById(elementId: string)
    {
        const element = document.getElementById(elementId);
        element.classList.remove("w3-hide");
    }
    
    public static HideElementById(elementId: string)
    {
        const element = document.getElementById(elementId);
        if(!element.classList.contains("w3-hide"))
        {
            element.classList.add("w3-hide");
        }
    }
    
    public static SetInnerHtmlById(elementId: string, innerHtml: string)
    {
        const element = document.getElementById(elementId);
        element.innerHTML = innerHtml;
    }

    public static SetInnerHtmlByClass(className: string, innerHtml: string)
    {
        const elements = document.querySelectorAll("." + className);
        elements.forEach(e => e.innerHTML = innerHtml);
    }
    
    public static GetInputFromElementWithId(elementId: string)
    {
        const element = <HTMLInputElement> document.getElementById(elementId);
        return element.value;
    }
    
    public static StopPropagation(event: Event)
    {
        event = event || window.event;
        event.stopPropagation();
    }
}