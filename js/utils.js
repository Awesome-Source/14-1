function isNumeric(value) 
{
    return /^\d+$/.test(value);
}

function SwitchClass(element, classToRemove, classToAdd)
{
    element.classList.remove(classToRemove);

    if(!element.classList.contains(classToAdd))
    {
        element.classList.add(classToAdd);
    }
}

function ShowElementById(elementId)
{
    const element =document.querySelector("#" + elementId);
    element.classList.remove("w3-hide");
}

function HideElementById(elementId)
{
    const element =document.querySelector("#" + elementId);
    if(!element.classList.contains("w3-hide"))
    {
        element.classList.add("w3-hide");
    }
}

function SetInnerHtmlById(elementId, innerHtml)
{
    const element = document.querySelector("#" + elementId);
    element.innerHTML = innerHtml;
}