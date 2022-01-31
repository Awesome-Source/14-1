function isNumeric(value: string) 
{
    return /^\d+$/.test(value);
}

function SwitchClass(element: Element, classToRemove: string, classToAdd: string)
{
    element.classList.remove(classToRemove);

    if(!element.classList.contains(classToAdd))
    {
        element.classList.add(classToAdd);
    }
}

function ShowElementById(elementId: string)
{
    const element =document.querySelector("#" + elementId);
    element.classList.remove("w3-hide");
}

function HideElementById(elementId: string)
{
    const element =document.querySelector("#" + elementId);
    if(!element.classList.contains("w3-hide"))
    {
        element.classList.add("w3-hide");
    }
}

function SetInnerHtmlById(elementId: string, innerHtml: string)
{
    const element = document.querySelector("#" + elementId);
    element.innerHTML = innerHtml;
}

function GetInputFromElementById(elementId: string)
{
    const element = <HTMLInputElement> document.querySelector("#" + elementId);
    return element.value;
}